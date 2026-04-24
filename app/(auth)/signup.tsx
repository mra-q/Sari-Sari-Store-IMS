// Inventory/app/(auth)/signup.tsx

import AuthContainer from "@/components/auth/AuthContainer";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthInput from "@/components/auth/AuthInput";
import { useSignup } from "@/hooks/useSignup";

const TOTAL_STEPS = 3;

export default function Signup() {
  const { mutate: signup, isPending } = useSignup();
  const [step, setStep] = useState(1);
  
  // Step 1: Personal Information
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Step 2: Sari-Sari Store Details
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  
  // Step 3: Terms agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  const stepLabel = useMemo(() => {
    if (step === 1) return "Personal Information";
    if (step === 2) return "Sari-Sari Store Information";
    return "Review & Create";
  }, [step]);

  useEffect(() => {
    opacityAnim.setValue(0);
    translateAnim.setValue(16);
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step, opacityAnim, translateAnim]);

  const getMissingFields = () => {
    if (step === 1) {
      const missing = [];
      if (!firstName.trim()) missing.push("First Name");
      if (!lastName.trim()) missing.push("Last Name");
      if (!email.trim()) missing.push("Email Address");
      if (!phone.trim()) missing.push("Phone Number");
      if (!password) missing.push("Password");
      if (!confirmPassword) missing.push("Confirm Password");
      if (password && confirmPassword && password !== confirmPassword) {
        return ["Passwords do not match"];
      }
      if (password && password.length < 6) {
        return ["Password must be at least 6 characters"];
      }
      return missing;
    }

    if (step === 2) {
      const missing = [];
      if (!storeName.trim()) missing.push("Sari-Sari Store Name");
      if (!storeAddress.trim()) missing.push("Complete Address");
      if (!barangay.trim()) missing.push("Barangay");
      if (!city.trim()) missing.push("City / Municipality");
      if (!province.trim()) missing.push("Province");
      return missing;
    }

    if (step === 3) {
      if (!agreedToTerms) {
        return ["You must agree to the Terms of Service and Privacy Policy"];
      }
    }

    return [];
  };

  const canProceed = () => getMissingFields().length === 0;

  const handleNext = () => {
    const missing = getMissingFields();
    if (missing.length > 0) {
      const message = missing.includes("Passwords do not match")
        ? "Your passwords don't match. Please check and try again."
        : missing.includes("Password must be at least 6 characters")
        ? "Password must be at least 6 characters long."
        : `Please fill in the following: ${missing.join(", ")}`;
      Alert.alert("Oops! Missing Information", message);
      return;
    }
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSignup = () => {
    const missing = getMissingFields();
    if (missing.length > 0) {
      Alert.alert("Almost There!", "Please review and complete all required information.");
      return;
    }

    const fullAddress = `${storeAddress}, ${barangay}, ${city}, ${province}${postalCode ? `, ${postalCode}` : ""}`;

    signup(
      {
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        storeName: storeName.trim(),
        storeAddress: fullAddress,
        password,
      },
      {
        onSuccess: () => {
          Alert.alert(
            "Welcome Aboard! 🎉",
            "Your Sari-Sari Store account has been created successfully. You can now log in and start managing your inventory.",
            [{ text: "Log In Now", onPress: () => router.replace("/(auth)/login") }]
          );
        },
        onError: (error) => {
          Alert.alert(
            "Registration Failed",
            error.message ?? "We couldn't create your account. Please try again or contact support."
          );
        },
      }
    );
  };

  return (
    <AuthContainer>
      <View style={styles.wrapper}>
        {/* Step dots */}
        <View style={styles.stepsRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={styles.stepDotWrapper}>
              <View
                style={[
                  styles.stepDot,
                  i + 1 < step && styles.stepDotDone,
                  i + 1 === step && styles.stepDotActive,
                ]}
              >
                {i + 1 < step ? (
                  <Ionicons name="checkmark" size={10} color="#fff" />
                ) : (
                  <Text
                    style={[
                      styles.stepDotText,
                      i + 1 === step && styles.stepDotTextActive,
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < TOTAL_STEPS - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    i + 1 < step && styles.stepLineDone,
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Step label */}
        <View style={styles.stepLabelRow}>
          <Text style={styles.stepLabel}>{stepLabel}</Text>
          <Text style={styles.progressText}>
            Step {step} of {TOTAL_STEPS}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <Animated.View
            style={[
              styles.stepContent,
              {
                opacity: opacityAnim,
                transform: [{ translateY: translateAnim }],
              },
            ]}
          >
            {step === 1 && (
              <>
                <AuthInput
                  label="First Name"
                  placeholder=""
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />

                <AuthInput
                  label="Middle Name (Optional)"
                  placeholder=""
                  value={middleName}
                  onChangeText={setMiddleName}
                  autoCapitalize="words"
                />

                <AuthInput
                  label="Last Name"
                  placeholder=""
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />

                <AuthInput
                  label="Email Address"
                  placeholder=""
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <AuthInput
                  label="Phone Number"
                  placeholder=""
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />

                <AuthInput
                  label="Password"
                  placeholder=""
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                />

                <AuthInput
                  label="Confirm Password"
                  placeholder=""
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  isPassword
                />
              </>
            )}

            {step === 2 && (
              <>
                <AuthInput
                  label="Sari-Sari Store Name"
                  placeholder=""
                  value={storeName}
                  onChangeText={setStoreName}
                  autoCapitalize="words"
                />

                <AuthInput
                  label="Complete Address"
                  placeholder=""
                  value={storeAddress}
                  onChangeText={setStoreAddress}
                  autoCapitalize="words"
                  multiline
                  numberOfLines={2}
                />

                <AuthInput
                  label="Barangay"
                  placeholder=""
                  value={barangay}
                  onChangeText={setBarangay}
                  autoCapitalize="words"
                />

                <AuthInput
                  label="City / Municipality"
                  placeholder=""
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                />

                <AuthInput
                  label="Province"
                  placeholder=""
                  value={province}
                  onChangeText={setProvince}
                  autoCapitalize="words"
                />

                <AuthInput
                  label="Postal Code (Optional)"
                  placeholder=""
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="number-pad"
                />
              </>
            )}

            {step === 3 && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.reviewSection}>
                  <View style={styles.reviewHeader}>
                    <Ionicons name="person-outline" size={18} color="#2B3A7E" />
                    <Text style={styles.reviewHeaderText}>Personal Information</Text>
                  </View>
                  <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>Full Name</Text>
                    <Text style={styles.reviewValue}>
                      {firstName} {middleName} {lastName}
                    </Text>
                  </View>
                  <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>Email</Text>
                    <Text style={styles.reviewValue}>{email}</Text>
                  </View>
                  <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>Phone</Text>
                    <Text style={styles.reviewValue}>{phone}</Text>
                  </View>
                </View>

                <View style={styles.reviewSection}>
                  <View style={styles.reviewHeader}>
                    <Ionicons name="storefront-outline" size={18} color="#2B3A7E" />
                    <Text style={styles.reviewHeaderText}>Sari-Sari Store Details</Text>
                  </View>
                  <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>Store Name</Text>
                    <Text style={styles.reviewValue}>{storeName}</Text>
                  </View>
                  <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>Address</Text>
                    <Text style={styles.reviewValue}>
                      {storeAddress}, {barangay}, {city}, {province}
                      {postalCode ? `, ${postalCode}` : ""}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                    {agreedToTerms && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the{" "}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </Animated.View>

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[
                styles.navButton,
                step === 1 && styles.navButtonDisabled,
              ]}
              onPress={handleBack}
              disabled={step === 1}
            >
              <Ionicons
                name="arrow-back"
                size={16}
                color={step === 1 ? "#9CA3AF" : "#2B3A7E"}
              />
              <Text
                style={[styles.navText, step === 1 && styles.navTextDisabled]}
              >
                Back
              </Text>
            </TouchableOpacity>

            {step < TOTAL_STEPS ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !canProceed() && styles.primaryButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={!canProceed()}
              >
                <Text style={styles.primaryText}>Continue</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.submitButton,
                  (!canProceed() || isPending) && styles.primaryButtonDisabled,
                ]}
                onPress={handleSignup}
                disabled={!canProceed() || isPending}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.primaryText}>
                  {isPending ? "Creating..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <AuthFooter
          text="Already have an account?"
          linkText="Log in"
          href="/(auth)/login"
        />
      </View>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 20,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  stepDotWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  stepDotActive: {
    backgroundColor: "#2B3A7E",
    borderColor: "#2B3A7E",
    shadowColor: "#2B3A7E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  stepDotDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  stepDotText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Poppins_700Bold",
  },
  stepDotTextActive: {
    color: "#FFFFFF",
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 6,
    borderRadius: 2,
  },
  stepLineDone: {
    backgroundColor: "#10B981",
  },
  stepLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  progressText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
    backgroundColor: "#2B3A7E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  stepLabel: {
    fontSize: 17,
    color: "#111827",
    fontFamily: "Poppins_700Bold",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardAccent: {
    height: 5,
    backgroundColor: "#2B3A7E",
  },
  stepContent: {
    minHeight: 280,
    padding: 22,
    paddingBottom: 8,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
    backgroundColor: "#FAFBFC",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#2B3A7E",
    backgroundColor: "#FFFFFF",
  },
  navButtonDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  navText: {
    fontSize: 14,
    color: "#2B3A7E",
    fontFamily: "Poppins_700Bold",
  },
  navTextDisabled: {
    color: "#9CA3AF",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2B3A7E",
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#2B3A7E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButton: {
    flex: 1,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  reviewSection: {
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#E2E8F0",
  },
  reviewHeaderText: {
    fontSize: 14,
    color: "#2B3A7E",
    fontFamily: "Poppins_700Bold",
  },
  reviewItem: {
    marginBottom: 10,
  },
  reviewLabel: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reviewValue: {
    fontSize: 14,
    color: "#1E293B",
    fontFamily: "Poppins_500Medium",
    lineHeight: 20,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D97706",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: "#2B3A7E",
    borderColor: "#2B3A7E",
    shadowColor: "#2B3A7E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    fontFamily: "Poppins_500Medium",
    lineHeight: 18,
  },
  termsLink: {
    color: "#2B3A7E",
    fontFamily: "Poppins_700Bold",
    textDecorationLine: "underline",
  },
});
