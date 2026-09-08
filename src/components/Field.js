/** ช่องกรอก */
import { View, TextInput, StyleSheet } from "react-native";

import { colors, radius, glass } from "../theme";
import AppText from "./AppText";

export default function Field({ label, style, ...props }) {
  return (
    <View style={{ marginBottom: 18, width: "100%" }}>
      <AppText style={styles.label}>{label}</AppText>
      <TextInput style={[styles.input, style]} placeholderTextColor={colors.textGray} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, color: colors.textBody, marginBottom: 8, fontWeight: "600" },
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
