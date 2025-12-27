import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { Colors, palette, Typography } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackIcon from "@/assets/icons/ic_back.png";


type Role = "doctor" | "nurse" | "patient" | "relative";

type User = {
  id: string;
  role: Role;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = Colors.light;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  // mock data (sau này lấy từ context/api)
  const [user, setUser] = useState<User>({
    id: "1",
    role: "patient",
    fullName: "Trần Công Chính",
    email: "chandler@eonsr.com",
    phone: "111111111",
    address: "",
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Image source={BackIcon} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar block */}
        <View style={styles.avatarBlock}>
        <View style={styles.avatarWrap}>
            <View style={styles.avatar} />
            <TouchableOpacity style={styles.avatarEditBtn} activeOpacity={0.85}>
            <Text style={styles.avatarEditText}>✎</Text>
            </TouchableOpacity>
        </View>
        </View>


        <Label label="Email" />
        <TextInput 
          value={user.email ?? ""} 
          editable={true} 
          style={styles.input} />

        <Label label="Fullname" />
        <TextInput
          value={user.fullName ?? ""}
          onChangeText={(t) => setUser((p) => ({ ...p, fullName: t }))}
          style={styles.input}
        />

        <Label label="Phone number" />
        <TextInput
          value={user.phone ?? ""}
          onChangeText={(t) => setUser((p) => ({ ...p, phone: t }))}
          style={styles.input}
        />

        <Label label="Address" />
        <TextInput
          value={user.address ?? ""}
          onChangeText={(t) => setUser((p) => ({ ...p, address: t }))}
          style={styles.input}
        />

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Update</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Label({ label }: { label: string }) {
  return <Text style={{ fontSize: 14, color: palette.black, marginBottom: 6, marginTop: 12 }}>{label}</Text>;
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.white },

    header: {
      backgroundColor: palette.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingBottom: 12,  
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      width: 20,
      height: 20,
      tintColor: palette.white, 
    },

    headerTitle: {
      color: palette.white,
      fontSize: Typography.size.m,
      fontWeight: Typography.weight.medium,
    },

    avatarBlock: {
        alignItems: "center",
        marginTop: 12,
        marginBottom: 12,
    },

    avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.gray200,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    },

    avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: palette.gray300,
    },

    avatarEditBtn: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    },

    avatarEditText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: Typography.weight.bold,
    },

    content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 30 },
    section: { fontSize: 14, color: palette.black, marginTop: 8 },

    input: {
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.gray200,
      paddingHorizontal: 14,
      color: palette.black,
      backgroundColor: palette.white,
    },
    inputDisabled: { opacity: 0.6 },

    primaryButton: {
      height: 52,
      borderRadius: 999,
      backgroundColor: palette.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 18,
    },
    primaryButtonText: {
      color: palette.white,
      fontSize: Typography.size.m,
      fontWeight: Typography.weight.medium,
    },
  });
