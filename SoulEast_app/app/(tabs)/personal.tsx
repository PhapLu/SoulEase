import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import { Colors, palette, Radius, Spacing, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/header/Header";


type Role = "doctor" | "nurse" | "patient" | "relative";

type User = {
  id: string;
  role: Role;
  fullName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  defaultPassword?: string;

  doctorProfile?: { speciality?: string; description?: string };
  nurseProfile?: { assistDoctorId?: string };
  relativeProfile?: { relation?: string; patientId?: string };
};

export default function PersonalScreen() {
  const colorScheme = "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const router = useRouter();

  const insets = useSafeAreaInsets();

  // demo: bạn thay bằng data từ API/AuthContext
  const [user, setUser] = useState<User>({
    id: "1",
    role: "patient",
    fullName: "Trần Công Chính",
    email: "chandler@eonsr.com",
    phone: "111111111",
  });

  const onChange = (key: keyof User, value: any) =>
    setUser((prev) => ({ ...prev, [key]: value }));

  const onNestedChange = (group: "doctorProfile" | "nurseProfile" | "relativeProfile", key: string, value: any) =>
    setUser((prev) => ({
      ...prev,
      [group]: { ...(prev as any)[group], [key]: value },
    }));

  return (
    <View style={styles.container}>
      {/* Header*/}
      <Header title="Profile" />


      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar row */}
        <View style={styles.topRow}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.fullName || "—"}</Text>
            <Text style={styles.sub}>{user.email || "—"}</Text>
          </View>

          <TouchableOpacity style={styles.editChip} onPress={() => router.push("/profile/edit")}>
            <Text style={styles.editChipText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <Field label="Email" value={user.email} editable={false} onChangeText={() => {}} styles={styles} />
        <Field label="Fullname" value={user.fullName} onChangeText={(t) => onChange("fullName", t)} styles={styles} />
        <Field label="Phone number" value={user.phone} onChangeText={(t) => onChange("phone", t)} styles={styles} />

        {/* Role-based */}
        {user.role === "doctor" && (
          <>
            <Field label="Default password" value={user.defaultPassword} editable={false} onChangeText={() => {}} styles={styles} />
            <Field
              label="Speciality"
              value={user.doctorProfile?.speciality}
              onChangeText={(t) => onNestedChange("doctorProfile", "speciality", t)}
              styles={styles}
            />
            <Field
              label="Description"
              value={user.doctorProfile?.description}
              multiline
              onChangeText={(t) => onNestedChange("doctorProfile", "description", t)}
              styles={styles}
            />
          </>
        )}

        {user.role === "nurse" && (
          <Field
            label="Assist doctor ID"
            value={user.nurseProfile?.assistDoctorId}
            onChangeText={(t) => onNestedChange("nurseProfile", "assistDoctorId", t)}
            styles={styles}
          />
        )}

        {user.role === "relative" && (
          <>
            <Field
              label="Relation"
              value={user.relativeProfile?.relation}
              onChangeText={(t) => onNestedChange("relativeProfile", "relation", t)}
              styles={styles}
            />
            <Field
              label="Patient ID"
              value={user.relativeProfile?.patientId}
              onChangeText={(t) => onNestedChange("relativeProfile", "patientId", t)}
              styles={styles}
            />
          </>
        )}

        <TouchableOpacity onPress={() => router.replace("/(auth)")}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  editable = true,
  multiline = false,
  styles,
}: {
  label: string;
  value?: string;
  onChangeText: (t: string) => void;
  editable?: boolean;
  multiline?: boolean;
  styles: any;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value ?? ""}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        style={[styles.input, multiline && styles.textarea, !editable && styles.inputDisabled]}
        placeholderTextColor={palette.gray500}
      />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.white,
    },

    header: {
      backgroundColor: palette.primary,
      alignItems: "center",
      paddingHorizontal: 12,
      paddingBottom: 29,
    },
    headerTitle: {
      color: palette.white,
      fontSize: Typography.size.m,
      fontWeight: Typography.weight.medium,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 16,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
      marginTop: 10,

    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: palette.gray200,
    },
    name: {
      color: colors.text,
      fontSize: Typography.size.l,
      fontWeight: Typography.weight.bold,
    },
    sub: {
      color: palette.gray500,
      fontSize: Typography.size.m,
      marginTop: 2,
    },

    editChip: {
      backgroundColor: palette.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    editChipText: {
      color: palette.white,
      fontSize: 14,
      fontWeight: Typography.weight.medium,
    },

    sectionLabel: {
      color: colors.text,
      fontSize: 14,
      marginBottom: 20,
      marginTop: 20,
    },

    field: {
      marginBottom: 12,
    },
    label: {
      color: colors.text,
      fontSize: 14,
      marginBottom: 6,
    },
    input: {
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.gray200,
      paddingHorizontal: 14,
      color: colors.text,
      backgroundColor: palette.white,
    },
    textarea: {
      height: 96,
      paddingTop: 12,
      textAlignVertical: "top",
    },
    inputDisabled: {
      opacity: 0.6,
    },

    primaryButton: {
      height: 52,
      borderRadius: 999,
      backgroundColor: palette.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
    },
    primaryButtonText: {
      color: palette.white,
      fontSize: Typography.size.m,
      fontWeight: Typography.weight.medium,
    },

    logout: {
      color: palette.error,
      textAlign: "center",
      marginTop: 18,
      fontSize: 12,
    },
  });
