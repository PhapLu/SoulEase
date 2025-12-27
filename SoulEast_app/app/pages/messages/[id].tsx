import React, { useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors, palette, Typography } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackIcon from "@/assets/icons/ic_back.png";
import { Image } from "react-native";


type Msg = {
  id: string;
  from: "doctor" | "me";
  text: string;
};

const MOCK_CHAT: Record<string, { title: string; messages: Msg[] }> = {
  "dr-john": {
    title: "Dr. John",
    messages: [
      { id: "1", from: "doctor", text: "Hi, I'm your doctor" },
      { id: "2", from: "me", text: "Hi Dr. John" },
      { id: "3", from: "doctor", text: "Ok! Do you have any dishes in your mind? What taste" },
      { id: "4", from: "me", text: "I would like to eat bánh mì" },
      { id: "5", from: "doctor", text: "Share me your location, I will find your closest destination!" },
    ],
  },
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
    const insets = useSafeAreaInsets();

  const scheme = "light";
  const colors = Colors[scheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const chat = MOCK_CHAT[id ?? "dr-john"] ?? MOCK_CHAT["dr-john"];

  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Msg[]>(chat.messages);

  const listRef = useRef<FlatList<Msg>>(null);

  const onSend = () => {
    const t = text.trim();
    if (!t) return;

    const newMsg: Msg = { id: String(Date.now()), from: "me", text: t };
    setMessages((prev) => [...prev, newMsg]);
    setText("");

    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Image source={BackIcon} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
      
        <Text style={styles.topTitle}>{chat.title}</Text>

        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isMe = item.from === "me";
            return (
              <View style={[styles.bubbleRow, isMe ? styles.rowRight : styles.rowLeft]}>
                {!isMe ? <View style={styles.smallAvatar} /> : null}

                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleDoctor]}>
                  <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextDoctor]}>{item.text}</Text>
                </View>
              </View>
            );
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />

        {/* Composer */}
        <View style={styles.composer}>
          <TouchableOpacity style={styles.plusBtn} activeOpacity={0.85}>
            <Text style={styles.plusText}>＋</Text>
          </TouchableOpacity>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor={palette.gray500}
            style={styles.input}
          />

          <TouchableOpacity onPress={onSend} style={styles.sendBtn} activeOpacity={0.85}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.white },

    topbar: {
      height: 120,
      borderBottomWidth: 1,
      borderBottomColor: palette.gray200,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      backgroundColor: palette.white,
    },
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

    topTitle: { flex: 1, textAlign: "center", color: palette.white, fontSize: 14, fontWeight: Typography.weight.bold },

    listContent: { paddingHorizontal: 12, paddingVertical: 12, gap: 10 },

    bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
    rowLeft: { justifyContent: "flex-start" },
    rowRight: { justifyContent: "flex-end", alignSelf: "flex-end" },

    smallAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: palette.gray200 },

    bubble: {
      maxWidth: "75%",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
    },
    bubbleDoctor: {
      backgroundColor: palette.white,
      borderColor: palette.primary,
    },
    bubbleMe: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },

    bubbleText: { fontSize: 12, lineHeight: 16 },
    bubbleTextDoctor: { color: colors.text },
    bubbleTextMe: { color: palette.white },

    composer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: palette.gray200,
      backgroundColor: palette.white,
    },
    plusBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: palette.white,
      borderWidth: 1,
      borderColor: palette.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    plusText: { color: palette.primary, fontSize: 18, lineHeight: 18 },

    input: {
      flex: 1,
      height: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.gray200,
      paddingHorizontal: 14,
      color: colors.text,
      backgroundColor: palette.white,
    },

    sendBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    sendText: { color: palette.primary, fontSize: 18, lineHeight: 18 },
  });
