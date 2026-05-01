import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { lookupBarcode } from '@/services/barcodeService';
import { createStockMovement } from '@/services/stockMovementService';
import { useAuth } from '@/context/AuthContext';
import ActionButton from '@/components/ui/ActionButton';
import type { Product } from '@/types/product';
import type { MovementReason } from '@/types/stockMovement';
import { MOVEMENT_REASON_LABELS, MOVEMENT_REASON_DIRECTIONS } from '@/types/stockMovement';

type ScanMode = 'single' | 'bulk';

interface ScanEntry {
  id: string;
  barcode: string;
  product: Product | null;
  timestamp: string;
  applied: boolean;
  count: number;
}

interface ScanSessionProps {
  mode: ScanMode;
  onModeChange: (mode: ScanMode) => void;
  allowAddProduct?: boolean;
}

const COOLDOWN_MS = 1500;
const SCAN_REASONS: MovementReason[] = ['restock', 'sale', 'return', 'damage', 'theft', 'misc'];
const SUPPORTED_BARCODE_TYPES = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'codabar',
  'itf14',
  'qr',
  'pdf417',
  'aztec',
  'datamatrix',
] as const;

export default function ScanSession({ mode, onModeChange, allowAddProduct = false }: ScanSessionProps) {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [applying, setApplying] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<MovementReason>('restock');
  const lastScanRef = useRef<{ data: string; time: number } | null>(null);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!isScanning) return;
    const now = Date.now();
    if (lastScanRef.current?.data === data && now - lastScanRef.current.time < COOLDOWN_MS) return;
    lastScanRef.current = { data, time: now };

    if (mode === 'single') setIsScanning(false);

    const entryId = `scan-${Date.now()}`;

    setHistory((prev) => {
      if (mode === 'bulk') {
        const existing = prev.find((item) => item.barcode === data && !item.applied);
        if (existing) {
          return prev.map((item) =>
            item.id === existing.id
              ? { ...item, count: item.count + 1, timestamp: new Date().toISOString() }
              : item,
          );
        }
      }

      return [
        { id: entryId, barcode: data, product: null, timestamp: new Date().toISOString(), applied: false, count: 1 },
        ...prev,
      ];
    });

    try {
      const product = await lookupBarcode(data);
      setHistory((prev) =>
        prev.map((e) => (e.barcode === data && !e.product && !e.applied ? { ...e, product } : e)),
      );
    } catch {
      // keep product as null
    }
  };

  const applyMovement = async (entry: ScanEntry, quantityOverride?: number) => {
    if (!entry.product || !user) return;
    const quantity = quantityOverride ?? entry.count;
    const direction = MOVEMENT_REASON_DIRECTIONS[selectedReason];

    try {
      await createStockMovement(
        { productId: entry.product.id, direction, reason: selectedReason, quantity },
        user.id,
        user.name,
      );

      setHistory((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, applied: true } : e)),
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to update stock.');
    }
  };

  const handleApplyEntry = async (entry: ScanEntry) => {
    setApplying(entry.id);
    await applyMovement(entry);
    setApplying(null);
  };

  const handleApplyAll = async () => {
    if (!user) return;
    setApplying('all');
    for (const entry of history) {
      if (entry.applied || !entry.product) continue;
      await applyMovement(entry, entry.count);
    }
    setApplying(null);
  };

  const clearHistory = () => {
    setHistory([]);
    setIsScanning(true);
  };

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.permissionBox}>
        <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <ActionButton label="Grant Access" onPress={requestPermission} variant="secondary" fullWidth={false} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mode Toggle */}
      <View style={styles.modeRow}>
        {(['single', 'bulk'] as ScanMode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            onPress={() => { onModeChange(m); setIsScanning(true); }}
          >
            <MaterialCommunityIcons
              name={m === 'single' ? 'barcode-scan' : 'barcode'}
              size={16}
              color={mode === m ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
              {m === 'single' ? 'Single' : 'Bulk'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reason Selector */}
      <View style={styles.reasonRow}>
        {SCAN_REASONS.map((reason) => (
          <TouchableOpacity
            key={reason}
            style={[styles.reasonChip, selectedReason === reason && styles.reasonChipActive]}
            onPress={() => setSelectedReason(reason)}
          >
            <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextActive]}>
              {MOVEMENT_REASON_LABELS[reason]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Camera */}
      <View style={styles.cameraWrap}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: [...SUPPORTED_BARCODE_TYPES] }}
          onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
        />
        <View style={styles.scanFrame} pointerEvents="none" />
        {mode === 'bulk' && (
          <View style={styles.bulkBadge}>
            <Text style={styles.bulkBadgeText}>BULK MODE — Keep scanning</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {mode === 'single' && !isScanning && (
          <TouchableOpacity style={styles.rescanBtn} onPress={() => setIsScanning(true)}>
            <Ionicons name="refresh-outline" size={18} color="#2B3A7E" />
            <Text style={styles.rescanText}>Scan Again</Text>
          </TouchableOpacity>
        )}
        {history.length > 0 && mode === 'bulk' && (
          <TouchableOpacity
            style={[styles.applyAllBtn, applying === 'all' && styles.applyAllBtnDisabled]}
            onPress={handleApplyAll}
            disabled={applying === 'all'}
          >
            <Text style={styles.applyAllText}>{applying === 'all' ? 'Applying...' : 'Apply All'}</Text>
          </TouchableOpacity>
        )}
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.clearText}>Clear History</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scan History */}
      {history.length > 0 && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          style={styles.historyList}
          contentContainerStyle={styles.historyContent}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyBarcode} numberOfLines={1}>{item.barcode}</Text>
                {item.product ? (
                  <Text style={styles.historyProduct} numberOfLines={1}>{item.product.name}</Text>
                ) : (
                  <Text style={styles.historyNotFound}>Product not found</Text>
                )}
              </View>
              <View style={styles.historyRight}>
                {item.applied ? (
                  <View style={styles.appliedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.appliedText}>Applied</Text>
                  </View>
                ) : item.product ? (
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => handleApplyEntry(item)}
                    disabled={applying === item.id}
                  >
                    <Text style={styles.applyBtnText}>
                      {applying === item.id ? '...' : `Apply (${item.count})`}
                    </Text>
                  </TouchableOpacity>
                ) : allowAddProduct ? (
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(owner)/add-product', params: { barcode: item.barcode } })}
                  >
                    <Text style={styles.addProductText}>Add Product</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  permissionTitle: { fontSize: 16, color: '#374151', fontFamily: 'Poppins_600SemiBold' },
  modeRow: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeBtnActive: { backgroundColor: '#2B3A7E', borderColor: '#2B3A7E' },
  modeBtnText: { fontSize: 14, color: '#6B7280', fontFamily: 'Poppins_600SemiBold' },
  modeBtnTextActive: { color: '#FFFFFF' },
  reasonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  reasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reasonChipActive: { backgroundColor: '#2B3A7E', borderColor: '#2B3A7E' },
  reasonText: { fontSize: 12, color: '#6B7280', fontFamily: 'Poppins_500Medium' },
  reasonTextActive: { color: '#FFFFFF' },
  cameraWrap: {
    marginHorizontal: 16,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: { flex: 1 },
  scanFrame: {
    position: 'absolute',
    top: '15%', left: '10%', right: '10%', bottom: '15%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
  },
  bulkBadge: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(43,58,126,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  bulkBadgeText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    alignItems: 'center',
  },
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6EEFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  rescanText: { fontSize: 13, color: '#2B3A7E', fontFamily: 'Poppins_600SemiBold' },
  applyAllBtn: {
    backgroundColor: '#2B3A7E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  applyAllBtnDisabled: { opacity: 0.7 },
  applyAllText: { fontSize: 13, color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 'auto',
  },
  clearText: { fontSize: 13, color: '#EF4444', fontFamily: 'Poppins_600SemiBold' },
  historyList: { flex: 1 },
  historyContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 8 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  historyLeft: { flex: 1, gap: 2 },
  historyBarcode: { fontSize: 12, color: '#9CA3AF', fontFamily: 'Poppins_400Regular' },
  historyProduct: { fontSize: 14, color: '#111827', fontFamily: 'Poppins_600SemiBold' },
  historyNotFound: { fontSize: 13, color: '#EF4444', fontFamily: 'Poppins_500Medium' },
  historyRight: { alignItems: 'flex-end' },
  appliedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  appliedText: { fontSize: 12, color: '#10B981', fontFamily: 'Poppins_600SemiBold' },
  applyBtn: {
    backgroundColor: '#2B3A7E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  applyBtnText: { fontSize: 12, color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold' },
  addProductText: { fontSize: 12, color: '#2B3A7E', fontFamily: 'Poppins_600SemiBold' },
});
