// inventory/components/staff/InviteStaffModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useInviteStaff } from '@/hooks/useStaff';
import type { InviteStaffResponse } from '@/services/staffServiceReal';

interface InviteStaffModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InviteStaffModal: React.FC<InviteStaffModalProps> = ({ visible, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [invitedStaff, setInvitedStaff] = useState<InviteStaffResponse | null>(null);
  
  const inviteMutation = useInviteStaff();

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const result = await inviteMutation.mutateAsync({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phone.trim(),
        temporary_password: password,
      });
      
      setInvitedStaff(result);
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.email?.[0] || 'Failed to invite staff member');
    }
  };

  const handleClose = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setShowPassword(false);
    setShowSuccess(false);
    setInvitedStaff(null);
    onClose();
  };

  const copyToClipboard = async (text: string) => {
    if (!text || !text.trim()) {
      Alert.alert('Unavailable', 'There is no value available to copy yet.');
      return;
    }

    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Copied to clipboard');
  };

  const copyCredentials = async () => {
    if (!invitedStaff) {
      return;
    }

    const credentials = [
      `Email: ${invitedStaff.email}`,
      `Temporary Password: ${invitedStaff.temp_password}`,
    ].join('\n');

    await copyToClipboard(credentials);
  };

  const safeEmail = invitedStaff?.email || invitedStaff?.username || '';
  const safePassword = invitedStaff?.temp_password || '';

  if (showSuccess && invitedStaff) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.successContainer}>
            <View style={styles.successHero}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              </View>

              <Text style={styles.successTitle}>Staff Invited Successfully!</Text>
              <Text style={styles.successSubtitle}>
                Share these credentials with the staff member before closing this screen.
              </Text>
            </View>

            <View style={styles.successActionRow}>
              <View style={styles.successHint}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#166534" />
                <Text style={styles.successHintText}>Credentials are ready to share</Text>
              </View>
              <TouchableOpacity style={styles.copyAllButton} onPress={copyCredentials}>
                <Ionicons name="copy-outline" size={16} color="#2B3A7E" />
                <Text style={styles.copyAllText}>Copy All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.credentialsBox}>
              <View style={styles.credentialCard}>
                <View style={styles.credentialCardHeader}>
                  <View style={styles.credentialIcon}>
                    <Ionicons name="mail-outline" size={18} color="#2B3A7E" />
                  </View>
                  <View style={styles.credentialHeaderText}>
                    <Text style={styles.credentialLabel}>Email Address</Text>
                    <Text style={styles.credentialMeta}>Use this email to sign in</Text>
                  </View>
                </View>

                <TextInput
                  value={safeEmail}
                  editable
                  selectTextOnFocus
                  showSoftInputOnFocus={false}
                  caretHidden
                  contextMenuHidden={false}
                  style={styles.credentialInput}
                />

                <TouchableOpacity
                  onPress={() => copyToClipboard(safeEmail)}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={16} color="#2B3A7E" />
                  <Text style={styles.copyButtonText}>Copy Email</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.credentialCard}>
                <View style={styles.credentialCardHeader}>
                  <View style={styles.credentialIcon}>
                    <Ionicons name="key-outline" size={18} color="#2B3A7E" />
                  </View>
                  <View style={styles.credentialHeaderText}>
                    <Text style={styles.credentialLabel}>Temporary Password</Text>
                    <Text style={styles.credentialMeta}>Ask staff to change this after login</Text>
                  </View>
                </View>

                <TextInput
                  value={safePassword}
                  editable
                  selectTextOnFocus
                  showSoftInputOnFocus={false}
                  caretHidden
                  contextMenuHidden={false}
                  style={styles.credentialInput}
                />

                <TouchableOpacity
                  onPress={() => copyToClipboard(safePassword)}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={16} color="#2B3A7E" />
                  <Text style={styles.copyButtonText}>Copy Password</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Invite Staff Member</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1234567890"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Temporary Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconButton}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.generateButton} onPress={generatePassword}>
                <Ionicons name="refresh-outline" size={16} color="#2B3A7E" />
                <Text style={styles.generateText}>Auto-generate</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, inviteMutation.isPending && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Send Invite</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  iconButton: {
    padding: 12,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  generateText: {
    fontSize: 13,
    color: '#2B3A7E',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2B3A7E',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
  },
  successHero: {
    alignItems: 'center',
    marginBottom: 18,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  successActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  successHint: {
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
  copyAllText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  credentialsBox: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  credentialCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  credentialCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  credentialIcon: {
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
    fontSize: 13,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  credentialMeta: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  credentialText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
    lineHeight: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  credentialInput: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
    lineHeight: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    height: 52,
    opacity: 1,
    includeFontPadding: false,
  },
  copyButton: {
    marginTop: 10,
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  copyButtonText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  doneButton: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#2B3A7E',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
});
