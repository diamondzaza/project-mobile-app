/** ปุ่มไอคอนวงกลม **/
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors, radius, glass } from "../theme";


export default function IconButton({ icon, onPress, size = 20, color = colors.brown, style, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || icon}
      style={[styles.iconButton, glass.warm, style]}
    >
      <Feather name={icon} size={size} color={color} />
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
