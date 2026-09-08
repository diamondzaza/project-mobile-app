/** แถบหัวด้านบน  **/
import { View, Pressable, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";

import { colors, glass } from "../theme";
import AppText from "./AppText";

export default function Header({ title, onBack, right }) {
  return (
    <View style={[styles.header, glass.bar]}>
      {onBack ? (
        <Pressable onPress={onBack} style={{ padding: 4 }} hitSlop={8}>
          <ChevronLeft size={26} color={colors.textDark} strokeWidth={2.2} />
        </Pressable>
      ) : (
        <View style={{ width: 32 }} />
      )}
      <AppText style={styles.headerTitle}>{title}</AppText>
      {right ? right : <View style={{ width: 32 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark },
});
