import { palette, Typography } from "@/constants/theme";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { InputField, PasswordField } from "./AuthInput";
import { useAuth, validateEmail } from "@/context/AuthContext";
import { router } from "expo-router";

// Assets


// --- MOCK DATA ---
const MOCK_USER = {
    email: "john.carter@gmail.com",
    password: "123",
};

interface LoginSheetProps {
    sheetRef: any;
    animatedIndex: any;
}

export default function LoginSheet({ sheetRef, animatedIndex }: LoginSheetProps) {
    const { signIn, isLoading } = useAuth(); // Lấy hàm từ context

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // State lưu lỗi
    const [errors, setErrors] = useState({ email: "", password: "" });

    const snapPoints = useMemo(() => ["78%"], []);

    const handleInputFocus = useCallback(() => {
        sheetRef.current?.snapToIndex(1);
    }, [sheetRef]);

    // --- HÀM XỬ LÝ LOGIN ---
    const handleLogin = async () => {
        // Reset lỗi
        setErrors({ email: "", password: "" });
        let isValid = true;
        let newErrors = { email: "", password: "" };

        // 1. Validate Form cơ bản
        if (!email.trim()) {
            newErrors.email = "Vui lòng nhập email";
            isValid = false;
        } else if (!validateEmail(email)) {
            newErrors.email = "Định dạng email không hợp lệ";
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = "Vui lòng nhập mật khẩu";
            isValid = false;
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        // 2. Gọi Context để Login
        const result = await signIn(email, password);

        if (result.success) {
            console.log("Login Success via Context");
            router.replace("/(tabs)");
        } else {
            // Hiển thị lỗi từ Backend (Mock) trả về
            if (result.error?.includes("Email")) {
                setErrors((prev) => ({ ...prev, email: result.error || "" }));
            } else {
                setErrors((prev) => ({ ...prev, password: result.error || "Đăng nhập thất bại" }));
            }
        }
    };

    return (
        <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose={true} backgroundStyle={styles.bottomSheetBackground} animatedIndex={animatedIndex}>
            <BottomSheetScrollView contentContainerStyle={styles.popupContentContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.titleSection}>
                    <Text style={styles.screenTitle}>Đăng nhập</Text>
                    <Text style={styles.screenSubtitle}>Đăng nhập vào tài khoản của bạn</Text>
                </View>

                <View style={styles.innerContainer}>
                    <View style={styles.buttonWrapper}>
                        {/* Email Input với Error */}
                        <InputField
                            label="Email hoặc số điện thoại"
                            placeholder="john.carter@gmail.com"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrors({ ...errors, email: "" }); // Xóa lỗi khi gõ lại
                            }}
                            onFocus={handleInputFocus}
                            error={errors.email} // Truyền lỗi vào
                        />

                        <View>
                            {/* Password Input với Error */}
                            <PasswordField
                                label="Mật khẩu"
                                placeholder="••••••••••••"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setErrors({ ...errors, password: "" }); // Xóa lỗi khi gõ lại
                                }}
                                onFocus={handleInputFocus}
                                error={errors.password} // Truyền lỗi vào
                            />
                            <TouchableOpacity style={styles.forgotPasswordContainer}>
                                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Nút Đăng nhập gọi hàm handleLogin */}
                        <TouchableOpacity style={[styles.loginButtonPopup, isLoading && { opacity: 0.7 }]} onPress={handleLogin} disabled={isLoading}>
                            <Text style={styles.loginButtonText}>{isLoading ? "Đang xử lý..." : "Đăng nhập"}</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
                            <View style={styles.dividerLine} />
                        </View>
                    </View>
                </View>
            </BottomSheetScrollView>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    bottomSheetBackground: {
        borderColor: palette.gray200,
        borderWidth: 1,
        backgroundColor: palette.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: "#1A1C22",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.01,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 0,
    },
    popupContentContainer: {
        top: -16,
        display: "flex",
        flexDirection: "column",
        gap: 48,
        paddingHorizontal: 32,
        paddingVertical: 48,
    },
    innerContainer: { display: "flex", flexDirection: "column", gap: 24 },
    buttonWrapper: { display: "flex", flexDirection: "column", gap: 16 },
    titleSection: { alignItems: "center", display: "flex", gap: 8 },
    screenTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.medium, color: palette.gray800 },
    screenSubtitle: { fontSize: Typography.size.s, color: palette.gray500 },

    forgotPasswordContainer: { alignSelf: "flex-end", marginTop: 8 },
    forgotPasswordText: { color: palette.gray800, fontSize: Typography.size.s, textDecorationLine: "underline" },
    loginButtonPopup: {
        backgroundColor: palette.primary,
        borderRadius: 80,
        height: 63,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    loginButtonText: { color: palette.white, fontSize: Typography.size.m, fontWeight: Typography.weight.medium },
    dividerContainer: { flexDirection: "row", alignItems: "center", gap: 18, paddingTop: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: palette.gray500 },
    dividerText: { color: palette.gray500, fontSize: Typography.size.m },
    socialButton: {},
    googleButtonPopup: {
        backgroundColor: palette.primary,
        borderRadius: 80,
        height: 63,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap: 8,
    },
    googleIcon: { width: 20, height: 20, tintColor: palette.white },
    googleButtonText: { color: palette.white, fontSize: Typography.size.m, fontWeight: Typography.weight.medium },
    footerContainer: { flexDirection: "row", justifyContent: "center", gap: 8 },
    footerText: { color: palette.gray800, fontSize: Typography.size.s },
    registerText: { color: palette.gray800, fontSize: Typography.size.s, textDecorationLine: "underline" },
});
