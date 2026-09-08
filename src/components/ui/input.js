/** ui/Input */
import { TextInput, StyleSheet } from "react-native";

import { colors, radius, glass } from "../../theme";

export function Input({ style, ...props }) {
  return <TextInput style={[styles.input, style]} placeholderTextColor={colors.textGray} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 44,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.textDark,
    fontFamily: "BaiJamjuree_400Regular",
    ...glass.surface,
  },
});

export default Input;
