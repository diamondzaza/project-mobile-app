/** ฟอร์มเพิ่มสัตว์เลี้ยง  */
import { useState } from "react";
import { SafeAreaView, View, Pressable, Alert, Image, StyleSheet } from "react-native";
import { Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import AppText from "../components/AppText";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge } from "../components/ui";
import Header from "../components/Header";
import Field from "../components/Field";
import PetIcon from "../components/PetIcon";
import { colors, radius } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";


const PET_TYPES = [
  { key: "dog", label: "สุนัข", icon: "dog", healthyRange: [5, 7] },
  { key: "cat", label: "แมว", icon: "cat", healthyRange: [3, 4.5] },
  { key: "rabbit", label: "กระต่าย", icon: "rabbit", healthyRange: [1.5, 2.5] },
  { key: "bird", label: "นก", icon: "bird", healthyRange: [0.08, 0.12] },
  { key: "other", label: "อื่นๆ", icon: "paw", healthyRange: [3, 6] },
];

function AddPetScreen({ go, addPet }) {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState(null);
  const [type, setType] = useState(PET_TYPES[0]);
  const [otherType, setOtherType] = useState("");

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("ต้องการสิทธิ์การเข้าถึง", "กรุณาอนุญาตการเข้าถึงรูปภาพเพื่ออัปโหลดรูปสัตว์เลี้ยง");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (name.trim() === "") {
      Alert.alert("ยังไม่ได้กรอกชื่อ", "กรุณากรอกชื่อสัตว์เลี้ยง");
      return;
    }
    const initialWeight = parseFloat(weight);
    const weightToSeed = !isNaN(initialWeight) && initialWeight > 0 ? initialWeight : null;
    addPet(
      {
        id: Date.now().toString(),
        name: name.trim(),
        breed: breed.trim() || "ไม่ระบุสายพันธุ์",
        age: age.trim() || "แรกเกิด",
        icon: type.icon,
        typeLabel: type.key === "other" && otherType.trim() ? otherType.trim() : type.label,
        healthyRange: type.healthyRange,
        photo,
      },
      weightToSeed
    );
    go("home");
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title="เพิ่มสัตว์เลี้ยง" onBack={() => go("home")} />
      <AnimatedScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}>
        <Reveal>
          <Pressable onPress={pickPhoto} style={styles.avatarWrap}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarPhoto} resizeMode="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Camera size={28} color={colors.brownLight} strokeWidth={2} />
                <AppText style={styles.avatarPlaceholderText}>เพิ่มรูป</AppText>
              </View>
            )}
          </Pressable>
          <AppText style={styles.uploadText}>แตะเพื่ออัปโหลดรูป</AppText>
        </Reveal>

        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลสัตว์เลี้ยง</CardTitle>
            </CardHeader>
            <CardContent>
              <AppText style={sharedStyles.label}>ประเภทสัตว์เลี้ยง</AppText>
              <View style={styles.typeRow}>
                {PET_TYPES.map((t) => {
                  const active = type.key === t.key;
                  return (
                    <Pressable key={t.key} onPress={() => setType(t)}>
                      <Badge variant={active ? "default" : "outline"} icon={<PetIcon name={t.icon} size={12} color={active ? "#FFFFFF" : colors.textBody} />}>
                        {t.label}
                      </Badge>
                    </Pressable>
                  );
                })}
              </View>
              
              {type.key === "other" && (
                <Field
                  label="ชื่อประเภท"
                  value={otherType}
                  onChangeText={setOtherType}
                  placeholder="เช่น แฮมสเตอร์"
                  autoFocus
                />
              )}
              <View style={{ marginTop: 6 }}>
                <Field label="ชื่อสัตว์เลี้ยง" value={name} onChangeText={setName} placeholder="เช่น Coco" />
                <Field label="สายพันธุ์" value={breed} onChangeText={setBreed} placeholder="เช่น โกลเด้นรีทรีฟเวอร์" />
                <Field label="อายุ" value={age} onChangeText={setAge} placeholder="เช่น 1 ปี" />
                <Field label="น้ำหนักเริ่มต้น (kg)" value={weight} onChangeText={setWeight} placeholder="เช่น 5.8" keyboardType="decimal-pad" />
              </View>
            </CardContent>
            <CardFooter>
              <Button title="บันทึก" onPress={handleSave} style={{ flex: 1 }} />
            </CardFooter>
          </Card>
        </Reveal>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { width: 100, height: 100, borderRadius: radius.full, backgroundColor: colors.cardTanBg, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginTop: 10, overflow: "hidden", alignSelf: "center" },
  avatarPhoto: { width: 100, height: 100, borderRadius: radius.full },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarPlaceholderText: { color: colors.textGray, fontSize: 12, fontWeight: "400", marginTop: 4 },
  uploadText: { color: colors.textGray, marginTop: 12, marginBottom: 16, fontSize: 14, fontWeight: "400", textAlign: "center" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
});

export default AddPetScreen;
