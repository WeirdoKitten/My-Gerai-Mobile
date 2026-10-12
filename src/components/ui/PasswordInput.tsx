import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { Pressable, StyleSheet, type TextInputProps, View } from "react-native";

import { colors, space, touch } from "@/theme";

import { Input } from "./Input";

type PasswordInputProps = Omit<TextInputProps, "secureTextEntry"> & { invalid?: boolean };

export function PasswordInput({ style, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <Input
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, style]}
        {...rest}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? "Sembunyikan password" : "Tampilkan password"}
        onPress={() => setVisible((v) => !v)}
        style={styles.toggle}
        hitSlop={4}
      >
        <MaterialCommunityIcons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={22}
          color={colors.inkMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { paddingRight: touch.min },
  toggle: {
    position: "absolute",
    right: space.xs,
    top: 0,
    bottom: 0,
    width: touch.min - space.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
