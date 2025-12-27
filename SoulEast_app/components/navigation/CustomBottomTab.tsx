import { Colors, palette } from "@/constants/theme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useMemo } from "react";
import { Image, ImageSourcePropType, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconSet = {
    [key: string]: {
        active: ImageSourcePropType;
        default: ImageSourcePropType;
    };
};

export function CustomBottomTab({ state, descriptors, navigation }: BottomTabBarProps) {
      const colorScheme = "light";
      const themeColors = Colors[colorScheme];
      const styles = useMemo(
          () => createStyles(themeColors),
          [themeColors]
      );

  const icons: IconSet = {
    index: {
        active: require("../../assets/icons/active/ic_home_active.png"),
        default: require("../../assets/icons/default/ic_home_default.png"),
    },
    messages: {
        // Lưu ý: key này dùng để map với route 'messages'
        active: require("../../assets/icons/active/ic_noti_active.png"),
        default: require("../../assets/icons/default/ic_noti_default.png"),
    },
    personal: {
        // Lưu ý: key này dùng để map với route 'personal'
        active: require("../../assets/icons/active/ic_user_active.png"),
        default: require("../../assets/icons/default/ic_user_default.png"),
    },
};
    const insets = useSafeAreaInsets();

    // Lấy màu từ theme

    const activeColor = themeColors.tabbarActive;
    const inactiveColor = themeColors.tabbarInactive;

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.tabBarContent,
                    {
                        // Cộng thêm padding đáy cho các dòng máy có tai thỏ (iPhone X trở lên)
                        height: 60 + (Platform.OS === "ios" ? insets.bottom : 10),
                        paddingBottom: Platform.OS === "ios" ? insets.bottom - 10 : 0,
                    },
                ]}
            >
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel ?? options.title ?? route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const iconSource = icons[route.name] ? (isFocused ? icons[route.name].active : icons[route.name].default) : null;

                    // --- XỬ LÝ NÚT GIỮA (LIÊN HỆ) ---
                    if (route.name === "contact") {
                        return (
                            <View key={index} style={styles.centerButtonWrapper}>
                                <TouchableOpacity
                                    onPress={onPress}
                                    activeOpacity={0.9}
                                    style={[
                                        styles.prominentButton,
                                    ]}
                                >
                                    {iconSource && <Image source={iconSource} style={{ width: 32, height: 32}} resizeMode="contain" />}
                                </TouchableOpacity>
                                <Text style={[styles.tabLabel, { color: activeColor, fontWeight: "600" }]}>{label.toString()}</Text>
                            </View>
                        );
                    }

                    // --- CÁC NÚT KHÁC ---

                    const color = isFocused ? activeColor : inactiveColor;
                    return (
                        <TouchableOpacity key={index} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
                            {iconSource && (
                                <Image
                                    source={iconSource}
                                    style={{ width: 24, height: 24 }}
                                    resizeMode="contain"
                                    tintColor={color}
                                />
                            )}
                            <Text style={[styles.tabLabel, { color, fontWeight: isFocused ? "600" : "400" }]}>{label.toString()}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
        elevation: 0,
        
    },
    tabBarContent: {
        flexDirection: "row",
        width: "100%",
        // Bo tròn 2 góc trên theo thiết kế mới
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: colors.tabbarBackground,

        // Shadow chỉ áp dụng cho thanh Bar, KHÔNG áp dụng cho nút tròn
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        paddingTop: 10,
    },
    tabLabel: {
        fontSize: 11,
        marginTop: 4,
        fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
    },

    // --- STYLE NÚT GIỮA ---
    centerButtonWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: -34, // Đẩy lên cao để tạo độ lồi
        zIndex: 10,
    },
    prominentButton: {
        width: 64,
        height: 64,
        borderRadius: 32, // Tròn tuyệt đối
        tintColor: colors.tabIconSelected,
        backgroundColor: palette.white,
        justifyContent: "center",
        alignItems: "center",

        // ✅ KỸ THUẬT QUAN TRỌNG:
        // Dùng Border để tạo đường cong, nhưng BỎ SHADOW
        // Điều này giúp phần dưới của nút "tan" vào thanh bar
        borderWidth: 5,
        // borderColor được set động (cùng màu với thanh bar)
        borderColor: colors.tabIconSelected,

        marginBottom: 6,

        // ❌ QUAN TRỌNG: KHÔNG ĐƯỢC CÓ SHADOW Ở ĐÂY
        // Nếu có shadow, nó sẽ tạo ra vệt đen ngăn cách nút và thanh bar
    },
});
