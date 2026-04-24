import CardboardHeader from "@/components/CardboardHeader";
import { RoleBasedView } from "@/components/RoleBasedView";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { getRoleLabel, getUserDisplayName, getUserStoreName } from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, logout, changePassword } = useAuth();
  const { role, isOwner } = useUserRole();
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const displayName = getUserDisplayName(user);
  const email = user?.email || "email@example.com";
  const phone = user?.phone || "Not provided";
  const storeName = getUserStoreName(user);
  const storeAddress = user?.storeAddress || user?.store_address || "Not provided";
  const roleLabel = getRoleLabel(role);
  const mustChangePassword = user?.mustChangePassword || user?.must_change_password || false;
  const initials = useMemo(() => {
    const parts = displayName.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }, [displayName]);

  useEffect(() => {
    if (mustChangePassword) {
      setIsChangePasswordVisible(true);
    }
  }, [mustChangePassword]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const closePasswordModal = () => {
    if (mustChangePassword) {
      return;
    }

    resetPasswordForm();
    setIsChangePasswordVisible(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing Details", "Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Weak Password", "New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "New password and confirmation do not match.");
      return;
    }

    try {
      setIsSubmittingPassword(true);
      await changePassword(currentPassword, newPassword);
      resetPasswordForm();
      setIsChangePasswordVisible(false);
      Alert.alert("Password Updated", "Your password has been changed successfully.", [
        {
          text: "OK",
          onPress: () => {
            if (mustChangePassword && role === 'staff') {
              router.replace('/(staff)/inventory');
            }
          },
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to change password.";
      Alert.alert("Change Password Failed", message);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <CardboardHeader title="Profile" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.email}>{email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{roleLabel.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Role</Text>
              <Text style={styles.statValue}>{roleLabel}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <View style={styles.securityIconWrap}>
              <Ionicons
                name={mustChangePassword ? "warning-outline" : "shield-checkmark-outline"}
                size={22}
                color={mustChangePassword ? "#B45309" : "#2B3A7E"}
              />
            </View>
            <View style={styles.securityText}>
              <Text style={styles.securityTitle}>
                {mustChangePassword ? "Temporary password in use" : "Password protection"}
              </Text>
              <Text style={styles.securitySubtitle}>
                {mustChangePassword
                  ? "This account is still using a temporary password. Change it now to secure access."
                  : "Keep your account secure by updating your password whenever needed."}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.securityAction}
            activeOpacity={0.85}
            onPress={() => setIsChangePasswordVisible(true)}
          >
            <Ionicons name="key-outline" size={16} color="#FFFFFF" />
            <Text style={styles.securityActionText}>
              {mustChangePassword ? "Change Password Now" : "Change Password"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#2B3A7E" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{displayName}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#2B3A7E" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#2B3A7E" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{phone}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="key-outline" size={18} color="#2B3A7E" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.infoValue}>{user?.id || "N/A"}</Text>
            </View>
          </View>
        </View>

        {isOwner && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Store Details</Text>
            <View style={styles.infoRow}>
              <Ionicons name="storefront-outline" size={18} color="#2B3A7E" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Store Name</Text>
                <Text style={styles.infoValue}>{storeName}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#2B3A7E" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Store Address</Text>
                <Text style={styles.infoValue}>{storeAddress}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <RoleBasedView roles={["owner"]}>
            <TouchableOpacity
              style={styles.settingRow}
              activeOpacity={0.7}
              onPress={() => router.push("/(owner)/staff")}
            >
              <Ionicons name="people-outline" size={18} color="#2B3A7E" />
              <Text style={styles.settingText}>Staff Management</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
          </RoleBasedView>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={18} color="#2B3A7E" />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setIsChangePasswordVisible(true)}
          >
            <Ionicons
              name="key-outline"
              size={18}
              color="#2B3A7E"
            />
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#2B3A7E"
            />
            <Text style={styles.settingText}>Security Status</Text>
            <Text style={styles.settingValue}>
              {mustChangePassword ? "Action Needed" : "Protected"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isChangePasswordVisible}
        transparent
        animationType="fade"
        onRequestClose={closePasswordModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closePasswordModal}>
          <Pressable style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <Text style={styles.modalSubtitle}>
                  {mustChangePassword
                    ? "Your account uses a temporary password. Update it before continuing."
                    : "Enter your current password and choose a stronger new one."}
                </Text>
              </View>

              {!mustChangePassword && (
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={closePasswordModal}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.passwordGroup}>
              <Text style={styles.passwordLabel}>Current Password</Text>
              <View style={styles.passwordField}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter current password"
                  placeholderTextColor="#9CA3AF"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  style={styles.passwordIconButton}
                  onPress={() => setShowCurrentPassword((value) => !value)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.passwordGroup}>
              <Text style={styles.passwordLabel}>New Password</Text>
              <View style={styles.passwordField}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#9CA3AF"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.passwordIconButton}
                  onPress={() => setShowNewPassword((value) => !value)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.passwordGroup}>
              <Text style={styles.passwordLabel}>Confirm New Password</Text>
              <View style={styles.passwordField}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.passwordIconButton}
                  onPress={() => setShowConfirmPassword((value) => !value)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.modalHint}>
              Your new password should be different from the current one.
            </Text>

            <View style={styles.modalActions}>
              {!mustChangePassword && (
                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={closePasswordModal}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryActionText}>Cancel</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryAction,
                  mustChangePassword && styles.primaryActionFull,
                  isSubmittingPassword && styles.primaryActionDisabled,
                ]}
                onPress={handleChangePassword}
                activeOpacity={0.85}
                disabled={isSubmittingPassword}
              >
                {isSubmittingPassword ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.primaryActionText}>Update Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  securityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5EDF9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  securityHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  securityIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    color: "#111827",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  securitySubtitle: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  securityAction: {
    backgroundColor: "#2B3A7E",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  securityActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  profileTop: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E6EEFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#2B3A7E",
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    color: "#1f2937",
    fontFamily: "Poppins_700Bold",
  },
  email: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },
  roleBadge: {
    marginTop: 8,
    backgroundColor: "#2B3A7E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  roleText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  profileStats: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },
  statValue: {
    color: "#111827",
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Poppins_600SemiBold",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 15,
    marginBottom: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },
  infoValue: {
    color: "#111827",
    fontSize: 14,
    marginTop: 2,
    fontFamily: "Poppins_600SemiBold",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  settingText: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  settingValue: {
    color: "#2B3A7E",
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  modalTitleWrap: {
    flex: 1,
  },
  modalTitle: {
    color: "#111827",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  modalSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  passwordGroup: {
    marginBottom: 12,
  },
  passwordLabel: {
    color: "#374151",
    fontSize: 13,
    marginBottom: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  passwordField: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    paddingLeft: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  passwordIconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHint: {
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
    fontFamily: "Poppins_400Regular",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  secondaryActionText: {
    color: "#374151",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  primaryAction: {
    flex: 1,
    backgroundColor: "#2B3A7E",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
  },
  primaryActionFull: {
    flex: 1,
  },
  primaryActionDisabled: {
    opacity: 0.7,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
