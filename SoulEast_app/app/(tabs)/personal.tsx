import { Colors } from "@/constants/theme";
import { useMemo } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

export default function PersonalScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const themeColors = Colors[colorScheme];
    const styles = useMemo(
        () => createStyles(themeColors),
        [themeColors]
    );
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World!</Text>
      <Text style={styles.subtitle}>Personal</Text>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 100,
      paddingTop: 0,
    },
    title: {
      alignItems: "center",
      justifyContent: "center",
      color: colors.text,
    },
    subtitle: {
       alignItems: "center",
       justifyContent: "center",
       color: colors.text,
    },
  });
