import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StaffUserRecord } from '@/services/userService';

interface StaffListProps {
  staff: StaffUserRecord[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onEdit: (staff: StaffUserRecord) => void;
  onToggleStatus: (staff: StaffUserRecord) => void;
}

export default function StaffList({
  staff,
  refreshing = false,
  onRefresh,
  onEdit,
  onToggleStatus,
}: StaffListProps) {
  return (
    <FlatList
      data={staff}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.infoBlock}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {item.email} • {item.phone}
              </Text>
              <View style={styles.badgeRow}>
                <View style={styles.roleBadge}>
                  <Text style={styles.badgeText}>{item.role.toUpperCase()}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.isActive ? styles.activeBadge : styles.inactiveBadge,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="create-outline" size={16} color="#2B3A7E" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                item.isActive ? styles.deactivateButton : styles.activateButton,
              ]}
              onPress={() => onToggleStatus(item)}
            >
              <Ionicons
                name={item.isActive ? 'close-circle-outline' : 'checkmark-circle-outline'}
                size={16}
                color={item.isActive ? '#DC2626' : '#059669'}
              />
              <Text
                style={[
                  styles.actionText,
                  item.isActive ? styles.deactivateText : styles.activateText,
                ]}
              >
                {item.isActive ? 'Deactivate' : 'Activate'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No staff members yet.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  roleBadge: {
    backgroundColor: '#2B3A7E',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadge: {
    backgroundColor: '#10B981',
  },
  inactiveBadge: {
    backgroundColor: '#9CA3AF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#E6EEFF',
  },
  actionText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_500Medium',
  },
  deactivateButton: {
    backgroundColor: '#FEE2E2',
  },
  activateButton: {
    backgroundColor: '#DCFCE7',
  },
  deactivateText: {
    color: '#DC2626',
  },
  activateText: {
    color: '#059669',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
});
