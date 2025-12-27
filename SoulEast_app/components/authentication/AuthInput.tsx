import { palette, Typography } from "@/constants/theme";
import React, { useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native";

const EYE_SHOW = require('../../assets/icons/ic_eyeShow.png');
const EYE_HIDE = require('../../assets/icons/ic_eyeHide.png');

// Định nghĩa màu đỏ báo lỗi
const ERROR_COLOR = palette.error; 

interface InputFieldProps extends TextInputProps {
    label: string;
    containerStyle?: ViewStyle;
    error?: string; // <--- Thêm prop lỗi
}

export const InputField = ({ label, containerStyle, error, ...props }: InputFieldProps) => {
    return (
        <View style={[styles.inputGroup, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[
                    styles.input, 
                    error ? { borderColor: ERROR_COLOR } : null 
                ]}
                placeholderTextColor="#8A8A8A"
                {...props}
            />
            {/* Hiển thị text lỗi */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

interface PasswordFieldProps extends TextInputProps {
    label: string;
    containerStyle?: ViewStyle;
    error?: string; // <--- Thêm prop lỗi
}

export const PasswordField = ({ label, containerStyle, error, ...props }: PasswordFieldProps) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <View style={[styles.inputGroup, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <View style={[
                styles.passwordContainer,
                error ? { borderColor: ERROR_COLOR } : null // Đổi màu viền nếu có lỗi
            ]}>
                <TextInput
                    style={styles.passwordInput}
                    placeholderTextColor="#8A8A8A"
                    secureTextEntry={!isVisible}
                    {...props}
                />
                <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
                    <Image
                        source={isVisible ? EYE_SHOW : EYE_HIDE}
                        style={styles.eyeIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>
            {/* Hiển thị text lỗi */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    label: {
        fontSize: Typography.size.m,
        color: palette.gray800,
        fontWeight: Typography.weight.medium,
    },
    input: {
        borderWidth: 1,
        borderColor: palette.gray200,
        borderRadius: 80,
        paddingHorizontal: 24,
        height: 56,
        fontSize: Typography.size.m,
        color: palette.gray500,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: palette.gray200,
        borderRadius: 80,
        height: 56,
        paddingHorizontal: 24,
    },
    passwordInput: {
        flex: 1,
        height: 56,
        fontSize: Typography.size.m,
        color: palette.gray500,
    },
    eyeIcon: {
        width: 20,
        height: 20,
    },
    // Style cho text lỗi
    errorText: {
        fontSize: Typography.size.s,
        color: ERROR_COLOR,
        marginLeft: 12,
        marginTop: -4
    }
});