/** หน้าเข้าสู่ระบบ  */
import { useState } from "react";
import { SafeAreaView, View, Pressable, Image, StyleSheet, Alert } from "react-native";
import { Lock, User } from "lucide-react-native";

import AppText from "../components/AppText";
import AnimatedScrollView from "../components/AnimatedScrollView";
import AuthField from "../components/AuthField";
import GoogleIcon from "../components/GoogleIcon";
import { Card, CardContent, Button } from "../components/ui";
import { colors } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";


// ช่องเดียวรับทั้งอีเมลและชื่อผู้ใช้ — มี @ = ตรวจรูปแบบอีเมล, ไม่มี = ชื่อผู้ใช้ (3+ ตัว ไม่มีเว้นวรรค)
const validateIdentifier = (v) => {
  const t = v.trim();
  if (t.includes("@")) return /\S+@\S+\.\S+/.test(t) || "รูปแบบอีเมลไม่ถูกต้อง";
  return (t.length >= 3 && !/\s/.test(t)) || "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร ไม่มีเว้นวรรค";
};

function LoginScreen({ go, submitLogin, submitGoogle }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null); // error จาก server/Google แสดงเหนือปุ่มเข้าสู่ระบบ
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setFormError(null);
    const idResult = validateIdentifier(identifier);
    const next = {};
    if (idResult !== true) next.identifier = idResult;
    if (password.trim().length < 6) next.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const res = await submitLogin(identifier, password);
    setBusy(false);
    // error จาก server แสดงเป็นข้อความเตือนกลาง ไม่ยัดลงช่องรหัสผ่าน
    if (!res.ok) setFormError(res.error);
  };


  const loginWithGoogle = async () => {
    if (busy) return;
    setFormError(null);
    setBusy(true);
    const res = await submitGoogle();
    setBusy(false);
    if (!res.ok) setFormError(res.error);
  };

  const showForgotPassword = () =>
    Alert.alert(
      "ลืมรหัสผ่าน?",
      "ระบบยังไม่มีหน้ารีเซ็ตรหัสผ่านอัตโนมัติ\nกรุณาติดต่อผู้ดูแลระบบเพื่อขอรีเซ็ตรหัสผ่านของคุณ"
    );

  return (
    <SafeAreaView style={sharedStyles.container}>
      <AnimatedScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.logoWrap}>

          <Image source={require("../IMG/LOGO1-circle.webp")} style={styles.logoImg} resizeMode="contain" />
        </View>
        <AppText style={styles.title}>ยินดีต้อนรับกลับ</AppText>
        <AppText style={styles.subtitle}>เข้าสู่ระบบเพื่อใช้งาน Pet Care Planner ต่อ</AppText>

        <Card>
          <CardContent style={styles.cardContent}>

            <AuthField
              label="อีเมลหรือชื่อผู้ใช้"
              icon={User}
              value={identifier}
              onChangeText={(t) => {
                setIdentifier(t);
                setErrors((e) => ({ ...e, identifier: null }));
                setFormError(null);
              }}
              placeholder="you@email.com หรือ ชื่อผู้ใช้"
              error={errors.identifier}
            />
            <AuthField
              label="รหัสผ่าน"
              icon={Lock}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrors((e) => ({ ...e, password: null }));
              }}
              placeholder="••••••••"
              secure
              error={errors.password}
            />
            <View style={styles.forgotRow}>
              <Pressable
                onPress={showForgotPassword}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="ลืมรหัสผ่าน"
              >
                <AppText style={styles.forgotText}>ลืมรหัสผ่าน?</AppText>
              </Pressable>
            </View>

            {formError ? <AppText style={styles.formErrorText}>{formError}</AppText> : null}

            <Button
              title={busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              size="lg"
              onPress={submit}
              disabled={busy}
              style={styles.primaryButton}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText style={styles.dividerText}>หรือเข้าสู่ระบบด้วย</AppText>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="เข้าสู่ระบบด้วย Google"
              variant="outline"
              size="lg"
              onPress={loginWithGoogle}
              iconLeft={<GoogleIcon size={20} />}
              style={styles.googleButton}
            />
          </CardContent>
        </Card>

        <View style={styles.footerRow}>
          <AppText style={styles.footerText}>ยังไม่มีบัญชีใช่ไหม?</AppText>
          <Pressable onPress={() => go("register")} hitSlop={8} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <AppText style={styles.footerLink}>สมัครสมาชิก</AppText>
          </Pressable>
        </View>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 },
  logoWrap: { alignItems: "center", marginBottom: 16 },
  logoImg: { width: 100, height: 100 },
  title: { fontSize: 26, fontWeight: "700", color: colors.textDark, textAlign: "center" },
  subtitle: { fontSize: 14, fontWeight: "400", color: colors.textGray, textAlign: "center", marginTop: 6, marginBottom: 24 },
  cardContent: { paddingTop: 16 },
  // ลิงก์ลืมรหัสผ่าน — ชิดขวาใต้ช่องรหัสผ่าน (ใต้บรรทัด error ด้วย)
  forgotRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  forgotText: { fontSize: 13, fontWeight: "600", color: colors.accentDeep, textDecorationLine: "underline" },
  formErrorText: { fontSize: 13, fontWeight: "600", color: colors.danger, textAlign: "center", marginBottom: 10 },
  primaryButton: { width: "100%", marginTop: 4 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 18, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, fontWeight: "400", color: colors.textGray },
  googleButton: { width: "100%" },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24 },
  footerText: { fontSize: 14, fontWeight: "400", color: colors.textBody },
  footerLink: { fontSize: 14, fontWeight: "700", color: colors.textDark, textDecorationLine: "underline" },
});

export default LoginScreen;
