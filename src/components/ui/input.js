/** ui/Input — focus/error state อยู่ที่ตัว component เดียว ทุกช่องกรอกในแอปได้พฤติกรรมเดียวกัน */
import { useState } from "react";
import { TextInput, StyleSheet } from "react-native";

import { colors, radius, glass } from "../../theme";

export function Input({ style, error, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[styles.input, focused && styles.focused, error && styles.errorBorder, style]}
      placeholderTextColor={colors.textGray}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 44,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.textDark,
    fontFamily: "Kanit_400Regular",
    ...glass.surface,
  },
  focused: { borderColor: "rgba(122,92,66,0.7)" },
  errorBorder: { borderColor: colors.danger, borderWidth: 1 },
});

export default Input;
