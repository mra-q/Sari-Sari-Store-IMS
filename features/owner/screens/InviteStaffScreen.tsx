import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import CardboardHeader from '@/components/CardboardHeader';
import { RoleBasedView } from '@/components/RoleBasedView';
import {
  getStaffUsers,
  inviteStaff,
  type StaffInviteResult,
  type StaffUserRecord,
} from '@/services/userService';
import { useUserRole } from '@/hooks/useUserRole';

const INVITE_STEPS = [
  {
    number: '01',
    title: 'Create the account',
    description: 'Enter the teammate details and send the invite directly to the backend.',
    icon: 'person-add-outline',
  },
  {
    number: '02',
    title: 'Share the credentials',
    description: 'Copy the generated username and temporary password as soon as the invite succeeds.',
    icon: 'copy-outline',
  },
  {
    number: '03',
    title: 'Ask for a password reset',
    description: 'Have the staff member sign in and replace the temporary password on first use.',
    icon: 'shield-checkmark-outline',
  },
];

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

  const generatedLoginPreview = email.trim() || 'staff@example.com';
  const passwordModeLabel = tempPassword.trim().length > 0 ? 'Custom password' : 'Auto-generated';

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
      <CardboardHeader title="Invite Staff" />
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      <RoleBasedView
        roles={['owner']}
        fallback={
          <View style={styles.restrictedContainer}>
            <View style={styles.restrictedIconWrap}>
              <Ionicons name="lock-closed-outline" size={28} color="#64748B" />
            </View>
            <Text style={styles.restrictedTitle}>Access Restricted</Text>
            <Text style={styles.restrictedText}>
              Staff invitations are available for store owners only.
            </Text>
          </View>
        }
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.heroCard}>
              <View style={styles.heroGlow} />

              <View style={styles.heroHeader}>
                <View style={styles.heroTextBlock}>
                  <Text style={styles.heroEyebrow}>Owner workspace</Text>
                  <Text style={styles.heroTitle}>Invite new staff with a cleaner handoff flow</Text>
                  <Text style={styles.heroSubtitle}>
                    Create the account, copy the generated credentials, and keep your team roster in
                    sync from one place.
                  </Text>
                </View>

                <View style={styles.heroIconWrap}>
                  <Ionicons name="people-circle-outline" size={26} color="#2B3A7E" />
                </View>
              </View>

              <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <Ionicons name="cloud-done-outline" size={13} color="#2B3A7E" />
                  <Text style={styles.heroBadgeText}>Live backend invite</Text>
                </View>
                <View style={styles.heroBadge}>
                  <Ionicons name="shield-checkmark-outline" size={13} color="#2B3A7E" />
                  <Text style={styles.heroBadgeText}>Owner-only access</Text>
                </View>
                <View style={styles.heroBadge}>
                  <Ionicons name="key-outline" size={13} color="#2B3A7E" />
                  <Text style={styles.heroBadgeText}>Secure credential handoff</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{staffMembers.length}</Text>
                  <Text style={styles.statLabel}>Team members</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{activeStaffCount}</Text>
                  <Text style={styles.statLabel}>Active now</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{inactiveStaffCount}</Text>
                  <Text style={styles.statLabel}>Need review</Text>
                </View>
              </View>

              <View style={styles.heroActionRow}>
                <TouchableOpacity
                  style={styles.heroPrimaryAction}
                  onPress={() => router.push('/(owner)/staff')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="people-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.heroPrimaryActionText}>Open Team List</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.heroSecondaryAction}
                  onPress={loadStaffMembers}
                  activeOpacity={0.85}
                >
                  <Ionicons name="refresh-outline" size={16} color="#2B3A7E" />
                  <Text style={styles.heroSecondaryActionText}>
                    {loadingStaff ? 'Refreshing...' : 'Refresh'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.insightRow}>
              <View style={styles.insightCard}>
                <View style={styles.insightIconWrap}>
                  <Ionicons name="mail-open-outline" size={18} color="#2B3A7E" />
                </View>
                <View style={styles.insightTextBlock}>
                  <Text style={styles.insightTitle}>Username preview</Text>
                  <Text style={styles.insightValue} numberOfLines={1}>
                    {generatedLoginPreview}
                  </Text>
                  <Text style={styles.insightCaption}>The staff email becomes the login username.</Text>
                </View>
              </View>

              <View style={styles.insightCard}>
                <View style={styles.insightIconWrap}>
                  <Ionicons name="sparkles-outline" size={18} color="#2B3A7E" />
                </View>
                <View style={styles.insightTextBlock}>
                  <Text style={styles.insightTitle}>Password mode</Text>
                  <Text style={styles.insightValue}>{passwordModeLabel}</Text>
                  <Text style={styles.insightCaption}>Leave it blank to let the backend generate one.</Text>
                </View>
              </View>
            </View>

            <View style={styles.workflowCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTextBlock}>
                  <Text style={styles.sectionTitle}>Invitation Flow</Text>
                  <Text style={styles.sectionSubtitle}>
                    Keep the handoff consistent every time you onboard a new teammate.
                  </Text>
                </View>

                <View style={styles.sectionPill}>
                  <Ionicons name="git-network-outline" size={14} color="#2B3A7E" />
                  <Text style={styles.sectionPillText}>3-step flow</Text>
                </View>
              </View>

              {INVITE_STEPS.map((step, index) => (
                <View key={step.number} style={styles.workflowStepRow}>
                  <View style={styles.workflowRail}>
                    <View style={styles.workflowStepIcon}>
                      <Text style={styles.workflowStepNumber}>{step.number}</Text>
                    </View>
                    {index < INVITE_STEPS.length - 1 && <View style={styles.workflowLine} />}
                  </View>

                  <View style={styles.workflowContent}>
                    <View style={styles.workflowTitleRow}>
                      <Text style={styles.workflowStepTitle}>{step.title}</Text>
                      <View style={styles.workflowMiniIcon}>
                        <Ionicons name={step.icon as any} size={14} color="#2B3A7E" />
                      </View>
                    </View>
                    <Text style={styles.workflowStepText}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.formCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTextBlock}>
                  <Text style={styles.sectionTitle}>Staff Details</Text>
                  <Text style={styles.sectionSubtitle}>
                    Full name, email, and phone are required. You can supply a password or let the
                    backend create one for you.
                  </Text>
                </View>

                <View style={styles.sectionPill}>
                  <Ionicons name="person-outline" size={14} color="#2B3A7E" />
                  <Text style={styles.sectionPillText}>Staff role</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoChip}>
                  <Ionicons name="checkmark-done-outline" size={13} color="#64748B" />
                  <Text style={styles.infoChipText}>Create the account first, then share the response credentials.</Text>
                </View>
                <View style={styles.infoChip}>
                  <Ionicons name="time-outline" size={13} color="#64748B" />
                  <Text style={styles.infoChipText}>Temporary passwords should be changed after the first login.</Text>
                </View>
              </View>

              <View style={styles.formDivider} />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputShell}>
                  <View style={styles.inputIconWrap}>
                    <Ionicons name="person-outline" size={18} color="#64748B" />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Juan Dela Cruz"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputShell}>
                  <View style={styles.inputIconWrap}>
                    <Ionicons name="mail-outline" size={18} color="#64748B" />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder="staff@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputShell}>
                  <View style={styles.inputIconWrap}>
                    <Ionicons name="call-outline" size={18} color="#64748B" />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder="09XXXXXXXXX"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
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

                <View style={styles.inputShell}>
                  <View style={styles.inputIconWrap}>
                    <Ionicons name="key-outline" size={18} color="#64748B" />
                  </View>
                  <TextInput
                    style={styles.inputField}
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
                  If left blank, the backend will return a generated temporary password after the
                  invite is created.
                </Text>
              </View>
            </View>

            <View style={styles.previewCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTextBlock}>
                  <Text style={styles.sectionTitle}>Invite Preview</Text>
                  <Text style={styles.sectionSubtitle}>
                    A quick sanity check before you create the account.
                  </Text>
                </View>
                <View style={styles.previewBadge}>
                  <Ionicons name="eye-outline" size={14} color="#2B3A7E" />
                  <Text style={styles.previewBadgeText}>Live preview</Text>
                </View>
              </View>

              <View style={styles.previewMetricsRow}>
                <View style={styles.previewMetricCard}>
                  <Text style={styles.previewMetricLabel}>Access</Text>
                  <Text style={styles.previewMetricValue}>Staff</Text>
                </View>
                <View style={styles.previewMetricCard}>
                  <Text style={styles.previewMetricLabel}>Login</Text>
                  <Text style={styles.previewMetricValue} numberOfLines={1}>
                    {generatedLoginPreview}
                  </Text>
                </View>
              </View>

              <View style={styles.previewSummaryCard}>
                <View style={styles.previewSummaryRow}>
                  <Ionicons name="person-circle-outline" size={18} color="#2B3A7E" />
                  <Text style={styles.previewSummaryLabel}>Name</Text>
                  <Text style={styles.previewSummaryValue} numberOfLines={1}>
                    {fullName.trim() || 'Waiting for full name'}
                  </Text>
                </View>
                <View style={styles.previewSummaryRow}>
                  <Ionicons name="keypad-outline" size={18} color="#2B3A7E" />
                  <Text style={styles.previewSummaryLabel}>Password</Text>
                  <Text style={styles.previewSummaryValue}>{passwordModeLabel}</Text>
                </View>
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
                After a successful invite, copy the credentials right away and ask the staff member
                to update the temporary password on first sign-in.
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
                      Share these backend-issued credentials with the new team member before leaving
                      this page.
                    </Text>
                  </View>
                </View>

                <View style={styles.successHintRow}>
                  <View style={styles.successHintChip}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#166534" />
                    <Text style={styles.successHintText}>Copy and store these details now.</Text>
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
                      <Text style={styles.credentialHelpText}>Ask staff to replace this after login</Text>
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
              </View>
            )}

            <View style={styles.rosterCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTextBlock}>
                  <Text style={styles.sectionTitle}>Current Staff</Text>
                  <Text style={styles.sectionSubtitle}>
                    A quick snapshot of the team data coming from the owner staff endpoint.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.sectionPillButton}
                  onPress={() => router.push('/(owner)/staff')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="arrow-forward-outline" size={14} color="#2B3A7E" />
                  <Text style={styles.sectionPillText}>Manage team</Text>
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
                  <View style={styles.emptyStateIconWrap}>
                    <Ionicons name="people-outline" size={24} color="#94A3B8" />
                  </View>
                  <Text style={styles.emptyStateTitle}>No staff accounts yet</Text>
                  <Text style={styles.emptyStateText}>
                    Once you invite your first team member, they will appear here.
                  </Text>
                </View>
              ) : (
                staffMembers.slice(0, 5).map((member, index) => (
                  <View
                    key={member.id}
                    style={[styles.staffRow, index === 0 && styles.staffRowFirst]}
                  >
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
        </KeyboardAvoidingView>
      </RoleBasedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  backgroundOrbTop: {
    position: 'absolute',
    top: 90,
    right: -44,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(43,58,126,0.08)',
  },
  backgroundOrbBottom: {
    position: 'absolute',
    bottom: 130,
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
    paddingTop: 16,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5EDF9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -14,
    right: -14,
    width: 138,
    height: 138,
    borderRadius: 69,
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
    marginTop: 6,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
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
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroPrimaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2B3A7E',
    borderRadius: 14,
    paddingVertical: 12,
  },
  heroPrimaryActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  heroSecondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroSecondaryActionText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  insightRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  insightCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9EEF7',
    padding: 14,
  },
  insightIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  insightTextBlock: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 3,
  },
  insightValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
  },
  insightCaption: {
    marginTop: 5,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: 'Poppins_400Regular',
  },
  workflowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9EEF7',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  sectionTextBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
  },
  sectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sectionPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sectionPillText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  workflowStepRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  workflowRail: {
    alignItems: 'center',
  },
  workflowStepIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workflowStepNumber: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
  },
  workflowLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  workflowContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  workflowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  workflowMiniIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workflowStepTitle: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  workflowStepText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 17,
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
    marginBottom: 14,
  },
  infoRow: {
    gap: 10,
    marginBottom: 10,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  infoChipText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: 'Poppins_500Medium',
  },
  formDivider: {
    height: 1,
    backgroundColor: '#EFF3F8',
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
  inputShell: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingLeft: 12,
    paddingRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputField: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    paddingVertical: 14,
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
  passwordToggle: {
    width: 42,
    height: 42,
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
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9EEF7',
    marginBottom: 16,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  previewBadgeText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  previewMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  previewMetricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  previewMetricLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'Poppins_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  previewMetricValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
  },
  previewSummaryCard: {
    backgroundColor: '#EEF4FF',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  previewSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewSummaryLabel: {
    width: 72,
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  previewSummaryValue: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  submitButton: {
    backgroundColor: '#2B3A7E',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
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
    justifyContent: 'center',
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
    paddingHorizontal: 10,
  },
  emptyStateIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyStateTitle: {
    color: '#111827',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  emptyStateText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  staffRowFirst: {
    borderTopWidth: 0,
    paddingTop: 2,
  },
  staffAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    paddingHorizontal: 28,
  },
  restrictedIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  restrictedTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 6,
  },
  restrictedText: {
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
    lineHeight: 20,
  },
});
