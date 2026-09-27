/** หน้าสมัครสมาชิก*/
import { useState } from "react";
import { SafeAreaView, View, Pressable, StyleSheet } from "react-native";
import { User, AtSign, Mail, Lock, KeyRound, CheckCircle } from "lucide-react-native";

import Header from "../components/Header";
import AnimatedScrollView from "../components/AnimatedScrollView";
import AppText from "../components/AppText";
import AuthField from "../components/AuthField";
import GoogleIcon from "../components/GoogleIcon";
import { Card, CardContent, Button } from "../components/ui";
import { colors, radius } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";

// error จาก server ที่ควรโผล่ที่ช่องอีเมล (อีเมลซ้ำ) แทนช่องรหัสผ่าน
const EMAIL_TAKEN_PATTERN = /already|registered|duplicate|อีเมลนี้|ถูกใช้|ใช้แล้ว/i;

const mapRegisterError = (message) =>
  EMAIL_TAKEN_PATTERN.test(message || "")
    ? { email: message }
    : { password: message };


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
    if (!res.ok) setErrors(mapRegisterError(res.error));
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
            {FIELDS.map((f) =>
              f.key === "password" ? (
                // AuthField ไม่รองรับ hint — วาด label + hint เอง แล้วส่ง label={null} ให้ AuthField
                <View key={f.key}>
                  <View style={styles.passwordLabelRow}>
                    <AppText style={styles.fieldLabel}>{f.label}</AppText>
                    <AppText style={styles.fieldHint}>อย่างน้อย 6 ตัวอักษร</AppText>
                  </View>
                  <AuthField
                    icon={f.icon}
                    value={values[f.key]}
                    onChangeText={(t) => setValue(f.key, t)}
                    placeholder={f.placeholder}
                    autoCapitalize={f.autoCapitalize}
                    secure={f.secure}
                    error={errors[f.key]}
                  />
                </View>
              ) : (
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
              )
            )}

            {notice && (
              <View style={styles.noticeBanner}>
                {/* พื้น success ที่ opacity ต่ำ — แยกเลเยอร์เพื่อไม่ให้ตัวหนังสือจางตาม */}
                <View style={styles.noticeBannerBg} pointerEvents="none" />
                <CheckCircle size={16} color={colors.success} strokeWidth={2} />
                <AppText style={styles.noticeText}>{notice}</AppText>
              </View>
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
          <Pressable onPress={() => go("back")} hitSlop={8} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
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
  passwordLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: colors.textBody },
  fieldHint: { fontSize: 12, fontWeight: "400", color: colors.textGray },
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  noticeBannerBg: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.success, opacity: 0.12, borderRadius: radius.sm },
  noticeText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.success },
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
