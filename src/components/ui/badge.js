/** ui/Badge*/
import { View, StyleSheet } from "react-native";

import { colors } from "../../theme";
import AppText from "../AppText";


const VARIANTS = {
  default: { backgroundColor: "#A8552E", color: "#FFFFFF" },
  secondary: { backgroundColor: "rgba(232,196,160,0.5)", color: colors.textDark },
  outline: { backgroundColor: "transparent", color: colors.textBody, borderWidth: 1, borderColor: "rgba(255,255,255,0.6)" },
  success: { backgroundColor: "#F3D9C2", color: "#8F4A26" },
  warning: { backgroundColor: "#F6E0DC", color: "#A8473D" },
};

export function Badge({ children, variant = "default", style, textStyle, icon }) {
  const v = VARIANTS[variant] || VARIANTS.default;
  return (
    <View style={[styles.badge, { backgroundColor: v.backgroundColor, borderWidth: v.borderWidth || 0, borderColor: v.borderColor }, style]}>
      <View style={styles.row}>
        {icon}
        <AppText style={[styles.text, { color: v.color }, textStyle]}>{children}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  row: { flexDirection: "row", alignItems: "center", gap: 5 },
  text: { fontSize: 12, fontWeight: "600" },
});

export default Badge;
