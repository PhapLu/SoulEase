import React, { useMemo } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Colors, palette, Typography } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";


type Thread = {
  id: string;
  doctorName: string;
  doctorTitle: string;
  lastMessage: string;
  lastSeenText: string; // "5 mins ago"
  online: boolean;
  avatar: any; // require(...)
};

const MOCK_THREADS: Thread[] = [
  {
    id: "dr-john",
    doctorName: "Dr. John",
    doctorTitle: "Dr. John: Hi, I'm your doctor...",
    lastMessage: "Hi, I'm your doctor...",
    lastSeenText: "5 mins ago",
    online: true,
    avatar: require("../../assets/images/doctor-avatar.svg"), 
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const scheme = "light";
  const colors = Colors[scheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const userName = "User’s name"; 

  return (
    <View style={styles.container}>
      {/* Header*/}
            <View style={[styles.header, { paddingTop: insets.top }]}>
              <Text style={styles.headerTitle}>Message</Text>
      
              <View style={{ width: 36 }} />
            </View>

      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome {userName}</Text>
        <Text style={styles.section}>Your doctor</Text>

        <FlatList
          data={MOCK_THREADS}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.row}
              onPress={() => router.push({ pathname: "/messages/[id]", params: { id: item.id } })}
            >
              {/* Avatar */}
              <View style={styles.avatarWrap}>
                <Image source={item.avatar} style={styles.avatarImg} />
                {item.online ? <View style={styles.onlineDot} /> : null}
              </View>

              {/* Text */}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.doctorName}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.doctorTitle}
                </Text>
              </View>

              {/* Time */}
              <View style={styles.right}>
                <Text style={styles.time}>{item.lastSeenText}</Text>
                <View style={styles.smallDot} />
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.white },

   header: {
      backgroundColor: palette.primary,
      alignItems: "center",
      paddingBottom: 29,
      flexDirection: "column"
    },
    headerTitle: {
      color: palette.white,
      fontSize: Typography.size.m,
      fontWeight: Typography.weight.medium,
    },

    content: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: 18,
      
    },

    welcome: {
      color: colors.text,
      fontSize: 20,
      fontWeight: Typography.weight.bold,
      marginBottom: 6,
    },
    section: {
      color: palette.gray500,
      fontSize: 12,
      marginBottom: 12,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette.white,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: palette.gray200,
    },

    avatarWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
      backgroundColor: palette.gray200,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    },
    avatarImg: { width: 44, height: 44, borderRadius: 22 },

    onlineDot: {
      position: "absolute",
      right: 2,
      bottom: 2,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: palette.primary,
      borderWidth: 2,
      borderColor: palette.white,
    },

    name: { color: colors.text, fontSize: 14, fontWeight: Typography.weight.bold },
    preview: { color: palette.gray500, fontSize: 12, marginTop: 2 },

    right: { alignItems: "flex-end", marginLeft: 10 },
    time: { color: palette.gray500, fontSize: 11, marginBottom: 6 },
    smallDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.primary },
  });
