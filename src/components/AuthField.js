/** AuthField ห*/
import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { Input, Label } from "./ui";
import AppText from "./AppText";
import { colors } from "../theme";

export default function AuthField({ label, icon: Icon, value, onChangeText, placeholder, keyboardType, autoCapitalize = "none", autoCorrect = false, secure = false, error, ...props }) {
  const [hidden, setHidden] = useState(secure);
  return (
    <View style={styles.wrap}>
      {label ? <Label>{label}</Label> : null}
      <View style={styles.inputArea}>
        <Icon size={20} color={colors.textGray} strokeWidth={2} style={styles.leftIcon} pointerEvents="none" />
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={hidden}
          style={[styles.input, secure && styles.inputSecure, error ? styles.inputError : null]}
          {...props}
        />
        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "แสดงรหัสผ่าน" : "ซ่อนรหัสผ่าน"}
          >
            {hidden ? (
              <Eye size={20} color={colors.textGray} strokeWidth={2} />
            ) : (
              <EyeOff size={20} color={colors.textGray} strokeWidth={2} />
            )}
          </Pressable>
        )}
      </View>
      {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  inputArea: { position: "relative", justifyContent: "center" },
  leftIcon: { position: "absolute", left: 14, top: 12, zIndex: 1 },
  input: { paddingLeft: 44 },
 
  inputSecure: { paddingRight: 44 },
  inputError: { borderColor: "#B23A22" },
  eyeButton: { position: "absolute", right: 14, top: 12 },
  errorText: { color: "#B23A22", fontSize: 12, fontWeight: "600", marginTop: 6 },
});
