// Inventory/features/owner/screens/OwnerStaffScreen.tsx

import CardboardHeader from '@/components/CardboardHeader';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStaff, useToggleStaffActive } from '@/hooks/useStaff';
import { StaffCard } from '@/components/staff/StaffCard';
import { InviteStaffModal } from '@/components/staff/InviteStaffModal';
import { RoleBasedView } from '@/components/RoleBasedView';
import { useUserRole } from '@/hooks/useUserRole';
import { theme } from '@/theme';
import type { StaffMember } from '@/services/staffServiceReal';

export default function OwnerStaffScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  
  const { data: staff = [], isLoading, refetch, isRefetching } = useStaff();
  const toggleMutation = useToggleStaffActive();
  const { isOwner, isStaff } = useUserRole();

  React.useEffect(() => {
    if (!isOwner && isStaff) {
      router.replace('/(staff)/inventory');
    }
  }, [isOwner, isStaff]);

  const filteredStaff = staff.filter((member: StaffMember) => {
    const matchesSearch = 
      (member.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && member.is_active) ||
      (filter === 'inactive' && !member.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const activeCount = staff.filter((m: StaffMember) => m.is_active).length;
  const inactiveCount = staff.length - activeCount;

  const handleToggleActive = (id: number) => {
    toggleMutation.mutate(id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CardboardHeader title="Team" />
      <RoleBasedView
        roles={['owner']}
        fallback={
          <View style={styles.restrictedContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={theme.colors.neutral[300]} />
            <Text style={styles.restrictedTitle}>Access Restricted</Text>
            <Text style={styles.restrictedText}>
              Staff management is available for store owners only.
            </Text>
          </View>
        }
      >
        {/* Header Stats */}
        <View style={styles.headerStats}>
          <Text style={styles.headerSubtitle}>{staff.length} members</Text>
          <TouchableOpacity 
            style={styles.inviteButton} 
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={20} color={theme.colors.text.inverse} />
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={theme.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search team members..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.8}>
                <Ionicons name="close-circle" size={18} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardTotal]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={20} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{staff.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, styles.statCardActive]}>
            <View style={[styles.statIconContainer, styles.statIconActive]}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success[600]} />
            </View>
            <Text style={[styles.statValue, styles.statValueActive]}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, styles.statCardInactive]}>
            <View style={[styles.statIconContainer, styles.statIconInactive]}>
              <Ionicons name="pause-circle" size={20} color={theme.colors.neutral[500]} />
            </View>
            <Text style={[styles.statValue, styles.statValueInactive]}>{inactiveCount}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'active' && styles.filterChipActive]}
            onPress={() => setFilter('active')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="checkmark-circle" 
              size={14} 
              color={filter === 'active' ? theme.colors.text.inverse : theme.colors.success[600]} 
            />
            <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'inactive' && styles.filterChipActive]}
            onPress={() => setFilter('inactive')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="pause-circle" 
              size={14} 
              color={filter === 'inactive' ? theme.colors.text.inverse : theme.colors.neutral[500]} 
            />
            <Text style={[styles.filterText, filter === 'inactive' && styles.filterTextActive]}>
              Inactive
            </Text>
          </TouchableOpacity>
        </View>

        {/* Staff List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>Loading team members...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredStaff}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <StaffCard staff={item} onToggleActive={handleToggleActive} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={isRefetching} 
                onRefresh={refetch} 
                colors={[theme.colors.primary[500]]} 
                tintColor={theme.colors.primary[500]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="people-outline" size={64} color={theme.colors.neutral[300]} />
                </View>
                <Text style={styles.emptyTitle}>No team members found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Try adjusting your search' : 'Invite your first team member to get started'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity 
                    style={styles.emptyButton}
                    onPress={() => setModalVisible(true)}
                  >
                    <Ionicons name="person-add" size={18} color={theme.colors.text.inverse} />
                    <Text style={styles.emptyButtonText}>Invite Staff</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}

        <InviteStaffModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      </RoleBasedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.textStyles.body,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  headerSubtitle: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  inviteButtonText: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.inverse,
    fontFamily: theme.typography.fontFamily.semibold,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statCardTotal: {
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
  },
  statCardActive: {
    borderWidth: 1,
    borderColor: theme.colors.success[100],
  },
  statCardInactive: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  statIconActive: {
    backgroundColor: theme.colors.success[50],
  },
  statIconInactive: {
    backgroundColor: theme.colors.neutral[100],
  },
  statValue: {
    ...theme.textStyles.h2,
    color: theme.colors.text.primary,
  },
  statValueActive: {
    color: theme.colors.success[600],
  },
  statValueInactive: {
    color: theme.colors.neutral[600],
  },
  statLabel: {
    ...theme.textStyles.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },

  filterContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  filterText: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  filterTextActive: {
    color: theme.colors.text.inverse,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  loadingText: {
    ...theme.textStyles.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl * 2,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.textStyles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    ...theme.textStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  emptyButtonText: {
    ...theme.textStyles.body,
    color: theme.colors.text.inverse,
    fontFamily: theme.typography.fontFamily.semibold,
  },
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  restrictedTitle: {
    ...theme.textStyles.h3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  restrictedText: {
    ...theme.textStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
