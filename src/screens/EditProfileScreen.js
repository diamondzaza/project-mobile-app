/** หน้าจอแก้ไขข้อมูลโปรไฟล์เจ้าของ */
import { useState } from "react";
import { SafeAreaView, Alert } from "react-native";

import Header from "../components/Header";
import Field from "../components/Field";
import Button from "../components/Button";
import { sharedStyles } from "../theme/sharedStyles";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

// ตรวจรูปแบบอีเมลแบบง่าย + เบอร์โทรไทย 9-10 หลัก
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const isEmailValid = (v) => EMAIL_PATTERN.test(v.trim());
const isPhoneValid = (v) => /^[0-9]{9,10}$/.test(v.replace(/[-\s]/g, ""));

function EditProfileScreen({ go, user, updateUser }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [saving, setSaving] = useState(false);

  const emailError = email.trim() !== "" && !isEmailValid(email) ? "รูปแบบอีเมลไม่ถูกต้อง" : null;
  const phoneError =
    phone.trim() !== "" && !isPhoneValid(phone) ? "เบอร์โทรต้องเป็นตัวเลข 9-10 หลัก" : null;
  // dirty check — แจ้งก่อนทิ้งการแก้ไขที่ยังไม่บันทึก
  const isDirty =
    name !== user.name || email !== user.email || phone !== user.phone;

  const goBack = () => {
    if (!isDirty) {
      go("userProfile");
      return;
    }
    Alert.alert("ทิ้งการเปลี่ยนแปลง?", "ข้อมูลที่แก้ไขยังไม่ได้บันทึก", [
      { text: "แก้ไขต่อ", style: "cancel" },
      { text: "ทิ้งการเปลี่ยนแปลง", style: "destructive", onPress: () => go("userProfile") },
    ]);
  };

  const handleSave = () => {
    if (saving) return;
    if (!name.trim()) {
      Alert.alert("ยังไม่ได้กรอกชื่อ", "กรุณากรอกชื่อของคุณ");
      return;
    }
    if (emailError || phoneError) {
      Alert.alert("ข้อมูลไม่ถูกต้อง", "กรุณาตรวจสอบอีเมลและเบอร์โทรศัพท์อีกครั้ง");
      return;
    }
    setSaving(true);
    updateUser({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    setSaving(false);
    Alert.alert("บันทึกสำเร็จ", "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว", [
      { text: "ตกลง", onPress: () => go("userProfile") },
    ]);
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title="แก้ไขโปรไฟล์" onBack={goBack} />
      <AnimatedScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10 }}>
        <Reveal>
          <Field label="ชื่อ-นามสกุล" value={name} onChangeText={setName} placeholder="เช่น สมหญิง ใจดี" />
          <Field
            label="อีเมล"
            value={email}
            onChangeText={setEmail}
            placeholder="name@email.com"
            keyboardType="email-address"
            error={Boolean(emailError)}
            errorText={emailError}
          />
          <Field
            label="เบอร์โทรศัพท์"
            value={phone}
            onChangeText={setPhone}
            placeholder="08x-xxx-xxxx"
            keyboardType="phone-pad"
            error={Boolean(phoneError)}
            errorText={phoneError}
          />
          <Button
            title={saving ? "กำลังบันทึก..." : "บันทึก"}
            onPress={handleSave}
            disabled={saving}
            style={{ marginTop: 10 }}
          />
        </Reveal>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

export default EditProfileScreen;
