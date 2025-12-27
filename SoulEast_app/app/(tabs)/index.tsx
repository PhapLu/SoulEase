import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  useColorScheme,
  ScrollView,
  StatusBar,
} from "react-native";
import { Colors } from "@/constants/theme";


export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme];

  const styles = useMemo(
    () => createStyles(themeColors),
    [themeColors]
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >

      </ScrollView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 100,
      paddingTop: 0,
    },
  });