/** กล่องสถิติเล็ก  */
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors, radius, glass } from "../theme";
import AppText from "./AppText";

export default function StatBox({ icon, label, value, bgColor, iconColor }) {
  return (
    <View style={[styles.statBox, glass.surface]}>
      <View style={[styles.statIconWrap, { backgroundColor: bgColor, borderColor: "rgba(255,255,255,0.5)", borderWidth: 1 }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  statBox: {
    flex: 1,
    borderRadius: radius.md,
    alignItems: "center",
    paddingVertical: 16,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: colors.textDark },
  statLabel: { fontSize: 12, fontWeight: "400", color: colors.textGray, marginTop: 2 },
});
