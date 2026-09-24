/** หน้าสมัครสมาชิก*/
import { useState } from "react";
import { SafeAreaView, View, Pressable, StyleSheet } from "react-native";
import { User, AtSign, Mail, Lock, KeyRound } from "lucide-react-native";

import Header from "../components/Header";
import AnimatedScrollView from "../components/AnimatedScrollView";
import AppText from "../components/AppText";
import AuthField from "../components/AuthField";
import GoogleIcon from "../components/GoogleIcon";
import { Card, CardContent, Button } from "../components/ui";
import { colors } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";


const FIELDS = [
  {
    key: "name",
    label: "ชื่อ-นามสกุล",
    icon: User,
    placeholder: "ชื่อ-นามสกุล",
    autoCapitalize: "words",
    validate: (v) => v.trim().length > 0 || "กรุณากรอกชื่อ-นามสกุล",
  },
  {
    key: "username",
    label: "ชื่อผู้ใช้",
    icon: AtSign,
    placeholder: "ชื่อผู้ใช้",
    validate: (v) => v.trim().length >= 3 || "ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร",
  },
  {
    key: "email",
    label: "อีเมล",
    icon: Mail,
    placeholder: "email@example.com",
    keyboardType: "email-address",
    validate: (v) => /\S+@\S+\.\S+/.test(v.trim()) || "รูปแบบอีเมลไม่ถูกต้อง",
  },
  {
    key: "password",
    label: "รหัสผ่าน",
    icon: Lock,
    placeholder: "••••••••",
    secure: true,
    validate: (v) => v.trim().length >= 6 || "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
  },
  {
    key: "confirm",
    label: "ยืนยันรหัสผ่าน",
    icon: KeyRound,
    placeholder: "••••••••",
    secure: true,
    validate: (v, values) => v === values.password || "รหัสผ่านไม่ตรงกัน",
  },
];

const EMPTY_VALUES = Object.fromEntries(FIELDS.map((f) => [f.key, ""]));

function RegisterScreen({ go, submitRegister, submitGoogle }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const setValue = (key, t) => {
    setValues((v) => ({ ...v, [key]: t }));
    setErrors((e) => ({ ...e, [key]: null }));
    setNotice(null);
  };

  const submit = async () => {
    if (busy) return;
    const next = {};
    for (const f of FIELDS) {
      const result = f.validate(values[f.key], values);
      if (result !== true) next[f.key] = result;
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    // สมัครสมาชิกจริงผ่าน Supabase Auth
    setBusy(true);
    const res = await submitRegister({
      email: values.email,
      password: values.password,
      name: values.name,
      username: values.username,
      phone: values.phone,
    });
    setBusy(false);
    if (!res.ok) setErrors({ password: res.error });
    else if (res.needConfirm) setNotice("สมัครสำเร็จ! กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
  };


  const signupWithGoogle = async () => {
    if (busy) return;
    setBusy(true);
    const res = await submitGoogle();
    setBusy(false);
    if (!res.ok) setErrors({ password: res.error });
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title="สมัครสมาชิก" onBack={() => go("back")} />
      <AnimatedScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Card>
          <CardContent style={styles.cardContent}>
            {FIELDS.map((f) => (
              <AuthField
                key={f.key}
                label={f.label}
                icon={f.icon}
                value={values[f.key]}
                onChangeText={(t) => setValue(f.key, t)}
                placeholder={f.placeholder}
                keyboardType={f.keyboardType}
                autoCapitalize={f.autoCapitalize}
                secure={f.secure}
                error={errors[f.key]}
              />
            ))}

            {notice && (
              <AppText style={styles.notice}>{notice}</AppText>
            )}

            <Button
              title={busy ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
              size="lg"
              onPress={submit}
              disabled={busy}
              style={styles.primaryButton}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText style={styles.dividerText}>หรือสมัครสมาชิกด้วย</AppText>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="สมัครสมาชิกด้วย Google"
              variant="outline"
              size="lg"
              onPress={signupWithGoogle}
              iconLeft={<GoogleIcon size={20} />}
              style={styles.googleButton}
            />
          </CardContent>
        </Card>

        <View style={styles.footerRow}>
          <AppText style={styles.footerText}>มีบัญชีอยู่แล้วใช่ไหม?</AppText>
          <Pressable onPress={() => go("back")} hitSlop={8}>
            <AppText style={styles.footerLink}>เข้าสู่ระบบ</AppText>
          </Pressable>
        </View>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  cardContent: { paddingTop: 16 },
  notice: { fontSize: 13, color: colors.brown, marginTop: 4, marginBottom: 8, textAlign: "center" },
  primaryButton: { width: "100%", marginTop: 4 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 18, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, fontWeight: "400", color: colors.textGray },
  googleButton: { width: "100%" },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24 },
  footerText: { fontSize: 14, fontWeight: "400", color: colors.textBody },
  footerLink: { fontSize: 14, fontWeight: "700", color: colors.textDark, textDecorationLine: "underline" },
});

export default RegisterScreen;
