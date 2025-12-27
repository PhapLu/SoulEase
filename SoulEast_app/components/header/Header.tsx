import React from "react";
import { StyleSheet, Text, View, StatusBar, Platform } from "react-native";
import { palette, Typography } from "@/constants/theme";

interface HeaderProps {
    title: string;
}

export const Header = ({ title }: HeaderProps) => {
    return (
        <>
            <View style={styles.headerContainer} />
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
            backgroundColor: palette.primary,
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
        },
        headerTitleContainer: {
          height: 80,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: palette.primary,
        },
        headerTitle: {
            fontSize: Typography.size.m,
            fontWeight: Typography.weight.medium,
            color: palette.white,
        },
});
