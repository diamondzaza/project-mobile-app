/** การตั้งค่า Metro สำหรับ Expo — บังคับ lucide-react-native ไปบิลด์ CJS (.js) เพื่อหลีกเลี่ยงปัญหา resolve .mjs ของ Metro */
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// รองรับนามสกุล mjs/cjs สำหรับแพ็กเกจสมัยใหม่ที่ใช้บิลด์ ESM
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), "mjs", "cjs"];

// lucide-react-native ชี้ฟิลด์ react-native/module ไปบิลด์ ESM (.mjs) ซึ่ง Metro resolve ไม่ตก
// บังคับ specifier "lucide-react-native" ไปยังบิลด์ CommonJS (.js) แทน — ไฟล์ภายในเป็น require('./icons/*.js') ที่ resolve ได้ปกติ
// resolve ชื่อ bare package (ไม่ใช่ deep subpath) เพราะ exports map บล็อก subpath ที่ไม่ได้ประกาศ — Node จะใช้เงื่อนไข "require" ที่ "." ซึ่งชี้ไฟล์ CJS ให้เอง
const lucideCjs = require.resolve("lucide-react-native");
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "lucide-react-native") {
    return { type: "sourceFile", filePath: lucideCjs };
  }
  // มิฉะนั้นใช้ resolver ดีฟอลต์
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
