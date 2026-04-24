import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Header from '@/components/Header';
import { RoleBasedView } from '@/components/RoleBasedView';
import {
  getStaffUsers,
  inviteStaff,
  type StaffInviteResult,
  type StaffUserRecord,
} from '@/services/userService';
import { useUserRole } from '@/hooks/useUserRole';

export default function InviteStaffScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffMembers, setStaffMembers] = useState<StaffUserRecord[]>([]);
  const [latestInvite, setLatestInvite] = useState<StaffInviteResult | null>(null);
  const { isOwner, isStaff } = useUserRole();

  useEffect(() => {
    if (!isOwner && isStaff) {
      router.replace('/(staff)/inventory');
    }
  }, [isOwner, isStaff]);

  const loadStaffMembers = useCallback(async () => {
    try {
      setLoadingStaff(true);
      const data = await getStaffUsers();
      setStaffMembers(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load staff members.';
      Alert.alert('Load Failed', message);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) {
      loadStaffMembers();
    }
  }, [isOwner, loadStaffMembers]);

  const activeStaffCount = useMemo(
    () => staffMembers.filter((member) => member.isActive).length,
    [staffMembers],
  );

  const inactiveStaffCount = useMemo(
    () => staffMembers.filter((member) => !member.isActive).length,
    [staffMembers],
  );

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    (tempPassword.trim().length === 0 || tempPassword.trim().length >= 6);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let generated = '';

    for (let index = 0; index < 10; index += 1) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setTempPassword(generated);
    setShowPassword(true);
  };

  const copyValue = async (value: string, label: string) => {
    await Clipboard.setStringAsync(value);
    Alert.alert('Copied', `${label} copied to clipboard.`);
  };

  const copyCredentials = async () => {
    if (!latestInvite) {
      return;
    }

    const summary = [
      `Username: ${latestInvite.credentials.username}`,
      `Temporary Password: ${latestInvite.credentials.temporaryPassword}`,
    ].join('\n');

    await Clipboard.setStringAsync(summary);
    Alert.alert('Copied', 'Staff login credentials copied to clipboard.');
  };

  const handleInvite = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Missing Details', 'Please complete the required staff details.');
      return;
    }

    if (tempPassword.trim().length > 0 && tempPassword.trim().length < 6) {
      Alert.alert('Invalid Password', 'Temporary password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await inviteStaff({
        name: fullName,
        email,
        phone,
        role: 'staff',
        password: tempPassword.trim() || undefined,
      });

      setLatestInvite(result);
      setFullName('');
      setEmail('');
      setPhone('');
      setTempPassword('');
      setShowPassword(false);
      await loadStaffMembers();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create staff account.';
      Alert.alert('Invite Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Invite Staff" onBackPress={() => router.back()} />
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      <RoleBasedView
        roles={['owner']}
        fallback={
          <View style={styles.restrictedContainer}>
            <Text style={styles.restrictedText}>
              Staff invitations are available for store owners only.
            </Text>
          </View>
        }
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <View style={styles.heroHeader}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroEyebrow}>Owner tools</Text>
                <Text style={styles.heroTitle}>Invite staff with live backend access</Text>
                <Text style={styles.heroSubtitle}>
                  Create staff accounts directly from your backend and share the generated login
                  credentials right away.
                </Text>
              </View>

              <View style={styles.heroIconWrap}>
                <Ionicons name="person-add-outline" size={24} color="#2B3A7E" />
              </View>
            </View>

            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#2B3A7E" />
                <Text style={styles.heroBadgeText}>Owner only action</Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="flash-outline" size={13} color="#2B3A7E" />
                <Text style={styles.heroBadgeText}>Instant backend invite</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{staffMembers.length}</Text>
                <Text style={styles.statLabel}>Total Staff</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{activeStaffCount}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{inactiveStaffCount}</Text>
                <Text style={styles.statLabel}>Inactive</Text>
              </View>
            </View>
          </View>

          <View style={styles.workflowCard}>
            <View style={styles.workflowHeader}>
              <View>
                <Text style={styles.sectionTitle}>Invitation Flow</Text>
                <Text style={styles.sectionSubtitle}>
                  A quick guide for what happens after you create the account.
                </Text>
              </View>
              <View style={styles.workflowPill}>
                <Ionicons name="sparkles-outline" size={14} color="#2B3A7E" />
                <Text style={styles.workflowPillText}>3 steps</Text>
              </View>
            </View>

            <View style={styles.workflowRow}>
              <View style={styles.workflowStep}>
                <View style={styles.workflowStepIcon}>
                  <Text style={styles.workflowStepNumber}>1</Text>
                </View>
                <Text style={styles.workflowStepTitle}>Create</Text>
                <Text style={styles.workflowStepText}>Owner submits staff details.</Text>
              </View>
              <View style={styles.workflowStep}>
                <View style={styles.workflowStepIcon}>
                  <Text style={styles.workflowStepNumber}>2</Text>
                </View>
                <Text style={styles.workflowStepTitle}>Share</Text>
                <Text style={styles.workflowStepText}>Copy and send login credentials.</Text>
              </View>
              <View style={styles.workflowStep}>
                <View style={styles.workflowStepIcon}>
                  <Text style={styles.workflowStepNumber}>3</Text>
                </View>
                <Text style={styles.workflowStepTitle}>Secure</Text>
                <Text style={styles.workflowStepText}>Staff changes the temporary password.</Text>
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.sectionTitle}>Staff Details</Text>
                <Text style={styles.sectionSubtitle}>
                  The backend requires full name, email, and phone number. Password is optional.
                </Text>
              </View>

              <View style={styles.liveBadge}>
                <Ionicons name="cloud-done-outline" size={14} color="#2B3A7E" />
                <Text style={styles.liveBadgeText}>Backend Live</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoChip}>
                <Ionicons name="key-outline" size={13} color="#64748B" />
                <Text style={styles.infoChipText}>Leave password blank to auto-generate.</Text>
              </View>
              <View style={styles.infoChip}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#64748B" />
                <Text style={styles.infoChipText}>Only owners can create staff accounts.</Text>
              </View>
            </View>

            <View style={styles.formDivider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan Dela Cruz"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="staff@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="09XXXXXXXXX"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.inputLabel}>Temporary Password</Text>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={generatePassword}
                  activeOpacity={0.85}
                >
                  <Ionicons name="refresh-outline" size={14} color="#2B3A7E" />
                  <Text style={styles.generateButtonText}>Generate</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.passwordField}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Optional, minimum 6 characters"
                  placeholderTextColor="#9CA3AF"
                  value={tempPassword}
                  onChangeText={setTempPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword((current) => !current)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.passwordHint}>
                If you leave this blank, the backend will generate the temporary password for you.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, (!canSubmit || submitting) && styles.submitButtonDisabled]}
            onPress={handleInvite}
            disabled={!canSubmit || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>Create Staff Account</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.submitHelperCard}>
            <Ionicons name="information-circle-outline" size={16} color="#64748B" />
            <Text style={styles.submitHelperText}>
              After the invite succeeds, copy the credentials and ask the staff member to change
              the temporary password on first use.
            </Text>
          </View>

          {latestInvite && (
            <View style={styles.credentialsCard}>
              <View style={styles.credentialsHeader}>
                <View style={styles.successIconWrap}>
                  <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                </View>
                <View style={styles.credentialsTextBlock}>
                  <Text style={styles.credentialsTitle}>Invite created successfully</Text>
                  <Text style={styles.credentialsSubtitle}>
                    Share these backend-issued credentials with the new staff member.
                  </Text>
                </View>
              </View>

              <View style={styles.successHintRow}>
                <View style={styles.successHintChip}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#166534" />
                  <Text style={styles.successHintText}>Save these details before leaving.</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyAllButton}
                  onPress={copyCredentials}
                  activeOpacity={0.85}
                >
                  <Ionicons name="copy-outline" size={14} color="#2B3A7E" />
                  <Text style={styles.copyAllButtonText}>Copy All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.credentialCard}>
                <View style={styles.credentialCardHeader}>
                  <View style={styles.credentialIconWrap}>
                    <Ionicons name="person-circle-outline" size={18} color="#2B3A7E" />
                  </View>
                  <View style={styles.credentialHeaderText}>
                    <Text style={styles.credentialLabel}>Username</Text>
                    <Text style={styles.credentialHelpText}>Use this email to log in</Text>
                  </View>
                </View>

                <Text selectable style={styles.credentialValue}>
                  {latestInvite.credentials.username}
                </Text>

                <TouchableOpacity
                  style={styles.credentialCopyButton}
                  onPress={() => copyValue(latestInvite.credentials.username, 'Username')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="copy-outline" size={16} color="#2B3A7E" />
                  <Text style={styles.credentialCopyButtonText}>Copy Username</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.credentialCard}>
                <View style={styles.credentialCardHeader}>
                  <View style={styles.credentialIconWrap}>
                    <Ionicons name="key-outline" size={18} color="#2B3A7E" />
                  </View>
                  <View style={styles.credentialHeaderText}>
                    <Text style={styles.credentialLabel}>Temporary Password</Text>
                    <Text style={styles.credentialHelpText}>Staff should change this after login</Text>
                  </View>
                </View>

                <Text selectable style={styles.credentialValue}>
                  {latestInvite.credentials.temporaryPassword}
                </Text>

                <TouchableOpacity
                  style={styles.credentialCopyButton}
                  onPress={() =>
                    copyValue(
                      latestInvite.credentials.temporaryPassword,
                      'Temporary password',
                    )
                  }
                  activeOpacity={0.85}
                >
                  <Ionicons name="copy-outline" size={16} color="#2B3A7E" />
                  <Text style={styles.credentialCopyButtonText}>Copy Password</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.credentialReminder}>
                <Ionicons name="information-circle-outline" size={16} color="#64748B" />
                <Text style={styles.credentialReminderText}>
                  These credentials come from the backend invite response and can be copied
                  individually or all at once.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.rosterCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.sectionTitle}>Current Staff</Text>
                <Text style={styles.sectionSubtitle}>
                  This list is loaded from the backend owner staff endpoint.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadStaffMembers}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh-outline" size={16} color="#2B3A7E" />
              </TouchableOpacity>
            </View>

            <View style={styles.rosterSummaryRow}>
              <View style={styles.rosterSummaryChip}>
                <Ionicons name="checkmark-done-outline" size={13} color="#15803D" />
                <Text style={styles.rosterSummaryText}>{activeStaffCount} active</Text>
              </View>
              <View style={styles.rosterSummaryChip}>
                <Ionicons name="pause-circle-outline" size={13} color="#B91C1C" />
                <Text style={styles.rosterSummaryText}>{inactiveStaffCount} inactive</Text>
              </View>
            </View>

            {loadingStaff ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator size="small" color="#2B3A7E" />
                <Text style={styles.loadingText}>Loading staff list...</Text>
              </View>
            ) : staffMembers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={24} color="#94A3B8" />
                <Text style={styles.emptyStateText}>No staff accounts yet.</Text>
              </View>
            ) : (
              staffMembers.slice(0, 5).map((member) => (
                <View key={member.id} style={styles.staffRow}>
                  <View style={styles.staffAvatar}>
                    <Text style={styles.staffAvatarText}>
                      {(member.name || member.email).trim().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.staffTextBlock}>
                    <Text style={styles.staffName}>{member.name || member.email}</Text>
                    <Text style={styles.staffMeta}>{member.email}</Text>
                  </View>
                  <View
                    style={[
                      styles.staffStatusBadge,
                      !member.isActive && styles.staffStatusBadgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.staffStatusText,
                        !member.isActive && styles.staffStatusTextInactive,
                      ]}
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </RoleBasedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  backgroundOrbTop: {
    position: 'absolute',
    top: 78,
    right: -46,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(43,58,126,0.08)',
  },
  backgroundOrbBottom: {
    position: 'absolute',
    bottom: 120,
    left: -54,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(59,130,246,0.07)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EDF9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(43,58,126,0.08)',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 26,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
    marginTop: 6,
    maxWidth: 250,
  },
  heroIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  workflowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9EEF7',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  workflowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  workflowPillText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  workflowRow: {
    flexDirection: 'row',
    gap: 10,
  },
  workflowStep: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  workflowStepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  workflowStepNumber: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
  },
  workflowStepTitle: {
    fontSize: 13,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  workflowStepText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: 'Poppins_400Regular',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9EEF7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  formDivider: {
    height: 1,
    backgroundColor: '#EFF3F8',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
    maxWidth: 240,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  liveBadgeText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  infoRow: {
    gap: 10,
    marginBottom: 8,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoChipText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  inputGroup: {
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    color: '#111827',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  generateButtonText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  passwordField: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingLeft: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  passwordToggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordHint: {
    marginTop: 6,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: 'Poppins_400Regular',
  },
  submitButton: {
    backgroundColor: '#2B3A7E',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  submitHelperCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9EEF7',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  submitHelperText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: 'Poppins_500Medium',
  },
  credentialsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCEFE1',
    marginBottom: 16,
  },
  credentialsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  successIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  credentialsTextBlock: {
    flex: 1,
  },
  credentialsTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  credentialsSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
  },
  successHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  successHintChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  successHintText: {
    flex: 1,
    fontSize: 11,
    color: '#166534',
    fontFamily: 'Poppins_600SemiBold',
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  copyAllButtonText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  credentialCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 10,
  },
  credentialCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  credentialIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  credentialHeaderText: {
    flex: 1,
  },
  credentialLabel: {
    fontSize: 12,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  credentialHelpText: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
  },
  credentialValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    lineHeight: 20,
  },
  credentialCopyButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    paddingVertical: 11,
  },
  credentialCopyButtonText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  credentialReminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingTop: 2,
  },
  credentialReminderText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: 'Poppins_400Regular',
  },
  rosterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9EEF7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  rosterSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  rosterSummaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rosterSummaryText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_600SemiBold',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  loadingText: {
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  emptyStateText: {
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffAvatarText: {
    fontSize: 14,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
  },
  staffTextBlock: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  staffMeta: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
  },
  staffStatusBadge: {
    backgroundColor: '#ECFDF3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  staffStatusBadgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  staffStatusText: {
    fontSize: 11,
    color: '#15803D',
    fontFamily: 'Poppins_600SemiBold',
  },
  staffStatusTextInactive: {
    color: '#B91C1C',
  },
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  restrictedText: {
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
});
