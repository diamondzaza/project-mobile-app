/** ปุ่มไอคอนวงกลม — วาดด้วย lucide ผ่าน iconMap (รับชื่อเดิมหรือ component ก็ได้) */
import { Pressable, StyleSheet } from "react-native";

import { colors, radius, glass } from "../theme";
import { resolveIcon } from "./iconMap";

export default function IconButton({ icon, onPress, size = 20, color = colors.brown, style, accessibilityLabel }) {
  const IconComp = resolveIcon(icon);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || icon}
      style={({ pressed }) => [styles.iconButton, glass.warm, pressed && { opacity: 0.8 }, style]}
    >
      {IconComp ? <IconComp size={size} color={color} strokeWidth={2} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
