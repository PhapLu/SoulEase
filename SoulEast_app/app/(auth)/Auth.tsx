import { palette, Typography } from "@/constants/theme";
import React, { useCallback, useRef, useState } from "react";
import { Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import LoginSheet from "@/components/authentication/LoginSheet";
import { SafeAreaView } from "react-native-safe-area-context";

// Assets
const EMAIL_ICON_URI = require("../../assets/icons/ic_envelope.png");
const LOGO_URI = require("../../assets/images/logo.png");

const { height } = Dimensions.get("window");

export default function Login() {
    // Ref & Shared Values
    const loginSheetRef = useRef<any>(null);

    const sheetIndex = useSharedValue(-1);

    // --- Handlers ---
     const handleOpenLogin = useCallback(() => {
        setTimeout(() => {
            loginSheetRef.current?.snapToIndex(0);
        }, 100);
    }, []);

    // --- Animation Logic ---
    const logoAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(sheetIndex.value, [-1, 0], [0, -height * 0.22], Extrapolation.CLAMP);
        const scale = interpolate(sheetIndex.value, [-1, 0], [1, 1], Extrapolation.CLAMP);
        return {
            transform: [{ translateY: translateY }, { scale: scale }],
        };
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor={palette.bgMint} />

            {/* === PHẦN NỀN XANH === */}
            <SafeAreaView style={styles.backgroundContainer}>
                <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                    <Text style={styles.splashText}>SoulEase</Text>
                    <Image source={LOGO_URI} style={styles.logoImage} resizeMode="contain" />
                </Animated.View>
            </SafeAreaView>

            {/* === AUTHENTICATION 1 (Footer tĩnh) === */}
            <View style={styles.auth1Footer}>
                <View style={styles.auth1Content}>
                    <View style={styles.auth1Buttons}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleOpenLogin}>
                            <Image source={EMAIL_ICON_URI} style={[styles.btnIcon, { tintColor: "#fff" }]} />
                            <Text style={styles.primaryButtonText}>Log in by Email/Phone Number</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.legalText}>
                        By logging in, you agree to our <Text style={{ fontWeight: "600" }}>Terms of Use</Text> and <Text style={{ fontWeight: "600" }}>Privacy Policy</Text>.
                    </Text>
                </View>
            </View>

            {/* === POPUP COMPONENTS === */}

            {/* Login Sheet */}
            <LoginSheet sheetRef={loginSheetRef} animatedIndex={sheetIndex}/>

        </GestureHandlerRootView>
    );
}

// Style của file chính 
const styles = StyleSheet.create({
    backgroundContainer: {
        backgroundColor: palette.bgMint,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: height * 0.28,
    },
    logoContainer: {
        alignItems: "center",
    },
    logoImage: {
        width: 370,
        height: 162,
    },
    splashText: {
        textAlign: "center",
        fontWeight: Typography.weight.medium,
        color: palette.primaryAlt2,
        fontSize: 40,
    },
    // --- Auth 1 Footer ---
    auth1Footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "20%",
        backgroundColor: palette.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 32,
        paddingVertical: 48,
        shadowColor: "#1A1C22",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.01,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 0,
    },
    auth1Content: {
        flex: 1,
        gap: 24,
        alignItems: "center",
    },
    auth1Buttons: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
    },
    primaryButton: {
        gap: 8,
        backgroundColor: palette.primary,
        borderRadius: 80,
        height: 56,
        width: "100%",
        flexDirection: "row",
        paddingLeft: 82,
        alignItems: "center",
    },
    btnIcon: { width: 20, height: 20 },
    primaryButtonText: { color: palette.white, fontSize: Typography.size.m, fontWeight: Typography.weight.medium },
    legalText: {
        textAlign: "center",
        fontSize: Typography.size.xs,
        color: palette.gray800,
        lineHeight: 16,
    },
});
