import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';

interface RestockRequestModalProps {
  visible: boolean;
  product: Product | null;
  submitting?: boolean;
  onSubmit: (quantity: number, notes: string) => void;
  onCancel: () => void;
}

export default function RestockRequestModal({
  visible,
  product,
  submitting = false,
  onSubmit,
  onCancel,
}: RestockRequestModalProps) {
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!visible) {
      setQuantity('');
      setNotes('');
    }
  }, [visible]);

  const handleSubmit = () => {
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) return;
    onSubmit(qty, notes.trim());
  };

  if (!product) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="alert-circle-outline" size={26} color="#2B3A7E" />
          </View>
          <Text style={styles.title}>Request Restock</Text>
          <Text style={styles.subtitle}>{product.name}</Text>

          <Text style={styles.label}>Requested Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note for the owner"
            placeholderTextColor="#9CA3AF"
            multiline
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, (!quantity || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!quantity || submitting}
            >
              <Text style={styles.submitText}>{submitting ? 'Sending...' : 'Send Request'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 16, color: '#111827', fontFamily: 'Poppins_700Bold' },
  subtitle: { fontSize: 13, color: '#6B7280', fontFamily: 'Poppins_500Medium', marginBottom: 12 },
  label: { fontSize: 12, color: '#374151', fontFamily: 'Poppins_600SemiBold', marginTop: 8 },
  input: {
    marginTop: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
  },
  notesInput: {
    marginTop: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    color: '#111827',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: { color: '#374151', fontFamily: 'Poppins_600SemiBold' },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2B3A7E',
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold' },
});
