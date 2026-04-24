// Inventory/components/staff/StaffCard.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StaffMember } from '@/services/staffServiceReal';
import { theme } from '@/theme';

interface StaffCardProps {
  staff: StaffMember;
  onToggleActive: (id: number) => void;
}

export const StaffCard: React.FC<StaffCardProps> = ({ staff, onToggleActive }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const fullName = staff.full_name || `${staff.first_name} ${staff.last_name}`.trim() || staff.username;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(fullName)}</Text>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{staff.email}</Text>
          {(staff.phone_number || staff.phone) && (
            <Text style={styles.phone}>{staff.phone_number || staff.phone}</Text>
          )}
        </View>
        
        <Pressable 
          onPress={() => setMenuVisible(!menuVisible)} 
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed,
          ]}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text.tertiary} />
        </Pressable>
      </View>
      
      <View style={styles.footer}>
        <View style={[styles.badge, staff.is_active ? styles.activeBadge : styles.inactiveBadge]}>
          <View style={[styles.dot, staff.is_active ? styles.activeDot : styles.inactiveDot]} />
          <Text style={[styles.badgeText, staff.is_active ? styles.activeBadgeText : styles.inactiveBadgeText]}>
            {staff.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      {menuVisible && (
        <View style={styles.menu}>
          <Pressable 
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => {
              onToggleActive(staff.id);
              setMenuVisible(false);
            }}
          >
            <Ionicons 
              name={staff.is_active ? 'close-circle-outline' : 'checkmark-circle-outline'} 
              size={18} 
              color={staff.is_active ? theme.colors.danger[600] : theme.colors.success[600]} 
            />
            <Text style={[styles.menuText, staff.is_active ? styles.deactivateText : styles.activateText]}>
              {staff.is_active ? 'Deactivate' : 'Activate'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm + 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm + 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...theme.textStyles.bodyLarge,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
  },
  info: {
    flex: 1,
  },
  name: {
    ...theme.textStyles.bodyLarge,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  email: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  phone: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.secondary,
  },
  menuButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  menuButtonPressed: {
    backgroundColor: theme.colors.neutral[100],
  },
  footer: {
    marginTop: theme.spacing.sm + 4,
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  activeBadge: {
    backgroundColor: theme.colors.success[50],
  },
  inactiveBadge: {
    backgroundColor: theme.colors.neutral[100],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.borderRadius.full,
  },
  activeDot: {
    backgroundColor: theme.colors.success[600],
  },
  inactiveDot: {
    backgroundColor: theme.colors.neutral[400],
  },
  badgeText: {
    ...theme.textStyles.caption,
    fontWeight: theme.typography.fontWeight.medium,
  },
  activeBadgeText: {
    color: theme.colors.success[700],
  },
  inactiveBadgeText: {
    color: theme.colors.text.secondary,
  },
  menu: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.xs,
  },
  menuItemPressed: {
    backgroundColor: theme.colors.neutral[50],
  },
  menuText: {
    ...theme.textStyles.bodySmall,
    fontWeight: theme.typography.fontWeight.medium,
  },
  deactivateText: {
    color: theme.colors.danger[600],
  },
  activateText: {
    color: theme.colors.success[600],
  },
});
