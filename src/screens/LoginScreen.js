/** หน้าเข้าสู่ระบบ  */
import { useState } from "react";
import { SafeAreaView, View, Pressable, Image, StyleSheet } from "react-native";
import { User, Mail, Phone, Lock } from "lucide-react-native";

import AppText from "../components/AppText";
import AnimatedScrollView from "../components/AnimatedScrollView";
import AuthField from "../components/AuthField";
import GoogleIcon from "../components/GoogleIcon";
import { Card, CardContent, Button } from "../components/ui";
import { colors, radius, glass } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";


const METHODS = [
  {
    key: "username",
    label: "ชื่อผู้ใช้",
    icon: User,
    placeholder: "ชื่อผู้ใช้ของคุณ",
    keyboardType: "default",
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
    key: "phone",
    label: "เบอร์โทรศัพท์",
    icon: Phone,
    placeholder: "0812345678",
    keyboardType: "phone-pad",
    validate: (v) => v.replace(/\D/g, "").length >= 9 || "เบอร์โทรศัพท์ไม่ถูกต้อง",
  },
];

function LoginScreen({ go }) {
  const [method, setMethod] = useState(METHODS[0]);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const switchMethod = (m) => {
    setMethod(m);
    setIdentifier("");
    setErrors({});
  };

 
  const submit = () => {
    const idResult = method.validate(identifier);
    const next = {};
    if (idResult !== true) next.identifier = idResult;
    if (password.trim().length < 6) next.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    setErrors(next);
    if (Object.keys(next).length) return;
    go("home");
  };

  
  const loginWithGoogle = () => go("home");

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

            <View style={styles.methodRow}>
              {METHODS.map((m) => {
                const active = m.key === method.key;
                return (
                  <Pressable
                    key={m.key}
                    onPress={() => switchMethod(m)}
                    style={[styles.methodTab, active ? styles.methodTabActive : glass.surface]}
                  >
                    <AppText style={[styles.methodTabText, active && styles.methodTabTextActive]}>
                      {m.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <AuthField
              label={method.label}
              icon={method.icon}
              value={identifier}
              onChangeText={(t) => {
                setIdentifier(t);
                setErrors((e) => ({ ...e, identifier: null }));
              }}
              placeholder={method.placeholder}
              keyboardType={method.keyboardType}
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

            <Button title="เข้าสู่ระบบ" size="lg" onPress={submit} style={styles.primaryButton} />

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
          <Pressable onPress={() => go("register")} hitSlop={8}>
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
  methodRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  methodTab: { flex: 1, height: 38, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  methodTabActive: { backgroundColor: "#A8552E" },
  methodTabText: { fontSize: 13, fontWeight: "400", color: colors.textBody },
  methodTabTextActive: { color: "#FFFFFF", fontWeight: "600" },
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
