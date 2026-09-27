/** ui/Button*/
import { Pressable, StyleSheet, Platform } from "react-native";

import { colors, radius, glass } from "../../theme";
import AppText from "../AppText";


const VARIANTS = {
  default: { backgroundColor: colors.accentDeep, color: colors.white, borderWidth: 0, glass: false },
  secondary: { backgroundColor: "rgba(232,196,160,0.42)", color: colors.textDark, borderWidth: 1, glass: true },
  outline: { backgroundColor: "transparent", color: colors.textDark, borderWidth: 1, glass: true },
  ghost: { backgroundColor: "transparent", color: colors.textDark, borderWidth: 0, glass: false },
  destructive: { backgroundColor: colors.danger, color: colors.white, borderWidth: 0, glass: false },
};

const webInset = Platform.select({
  web: { boxShadow: "0 8px 24px rgba(90,52,25,0.22), inset 0 1px 0 rgba(255,255,255,0.45)" },
  default: {
    shadowColor: "#5A3419",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
});

const SIZES = {
  default: { height: 44, paddingHorizontal: 16 },
  sm: { height: 38, paddingHorizontal: 12 },
  lg: { height: 52, paddingHorizontal: 20 },
  icon: { width: 44, height: 44, paddingHorizontal: 0 },
};


export function Button({
  title,
  onPress,
  variant = "default",
  size = "default",
  style,
  textStyle,
  disabled,
  iconLeft,
  iconRight,
  children,
  ...props
}) {
  const v = VARIANTS[variant] || VARIANTS.default;
  const s = SIZES[size] || SIZES.default;
  const content = children ?? title;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      // size sm สูง 38 — เติม hitSlop ให้พื้นที่แตะรวม >= 44pt
      hitSlop={s.height < 44 ? { top: 3, bottom: 3, left: 2, right: 2 } : undefined}
      style={({ pressed }) => [
        styles.base,
        s,
        { backgroundColor: v.backgroundColor, borderWidth: v.borderWidth, borderColor: "rgba(255,255,255,0.55)" },
        v.glass ? glass.surface : webInset,
        disabled && { opacity: 0.5 },
        !disabled && pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}
      {...props}
    >
      {iconLeft}
      {content != null && (
        <AppText style={[styles.text, { color: v.color }, iconLeft || iconRight ? { marginHorizontal: 6 } : null, textStyle]}>
          {content}
        </AppText>
      )}
      {iconRight}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: { fontSize: 15, fontWeight: "600" },
});

export default Button;
