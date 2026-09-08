/** แถวรายการตั้งค่า */
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors } from "../theme";
import AppText from "./AppText";

export default function SettingsRow({ icon, label, onPress, danger, right }) {
  return (
    <Pressable onPress={onPress} style={styles.settingsRow}>
      <View style={[styles.settingsIconWrap, danger && { backgroundColor: "#FBE4E0" }]}>
        <Feather name={icon} size={18} color={danger ? colors.red : colors.brown} />
      </View>
      <AppText style={[styles.settingsLabel, danger && { color: colors.red }]}>{label}</AppText>
      {right ? right : <Feather name="chevron-right" size={18} color={colors.textGray} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  settingsIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.cardTanBg,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.textDark },
});
