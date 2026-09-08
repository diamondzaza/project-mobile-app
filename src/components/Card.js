/** การ์ดหลัก */
import { View, StyleSheet } from "react-native";

import { radius, glass } from "../theme";

export default function Card({ children, style, tan }) {
  return (
    <View style={[styles.card, tan ? glass.warm : null, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: 16,
    ...glass.surface,
  },
});
