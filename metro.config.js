/** การตั้งค่า Metro สำหรับ Expo */
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);


config.resolver.sourceExts = [...(config.resolver.sourceExts || []), "mjs", "cjs"];


const lucideCjs = require.resolve("lucide-react-native");
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "lucide-react-native") {
    return { type: "sourceFile", filePath: lucideCjs };
  }
 
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
