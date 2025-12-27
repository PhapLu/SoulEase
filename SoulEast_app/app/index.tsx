// import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing, Radius, Shadows, Typography, palette } from '@/constants/theme';

const Splash = () => {
    const scheme = useColorScheme(); // 'light' | 'dark'
    const theme = Colors[scheme ?? 'light'];
    
    const router = useRouter();
    //   const { user, loading } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/Auth"); // ✅ use relative path (no "/")
            //       if (user) {
            //         router.replace("/(tabs)/home");
            //       } else {
            //         router.replace("/(auth)/welcome");
            //       }
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
            <SafeAreaView style={styles.contentContainer}>
                <Text style={styles.splashText}>SoulEase</Text>
                <Image style={styles.splashscreen} source={require("../assets/images/logo.png")} resizeMode="contain" />
            </SafeAreaView>
    );
};

export default Splash;

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    contentContainer: {
        backgroundColor: palette.primary,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    splashscreen: {
        width: 370,
        height: 208,
    },
    splashText: {
        textAlign: "center",
        fontWeight: Typography.weight.medium,
        color: palette.white,
        fontSize: 40,
    }
});
