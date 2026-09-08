/** หน้าจอแก้ไขข้อมูลโปรไฟล์เจ้าของ */
import { useState } from "react";
import { SafeAreaView, Alert } from "react-native";

import Header from "../components/Header";
import Field from "../components/Field";
import Button from "../components/Button";
import { sharedStyles } from "../theme/sharedStyles";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

function EditProfileScreen({ go, user, updateUser }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("ยังไม่ได้กรอกชื่อ", "กรุณากรอกชื่อของคุณ");
      return;
    }
    updateUser({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    go("userProfile");
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title="แก้ไขโปรไฟล์" onBack={() => go("userProfile")} />
      <AnimatedScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10 }}>
        <Reveal>
          <Field label="ชื่อ-นามสกุล" value={name} onChangeText={setName} placeholder="ชื่อ-นามสกุล" />
          <Field label="อีเมล" value={email} onChangeText={setEmail} placeholder="อีเมล" keyboardType="email-address" />
          <Field label="เบอร์โทรศัพท์" value={phone} onChangeText={setPhone} placeholder="หมายเลขโทรศัพท์" keyboardType="phone-pad" />
          <Button title="บันทึก" onPress={handleSave} style={{ marginTop: 10 }} />
        </Reveal>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

export default EditProfileScreen;
