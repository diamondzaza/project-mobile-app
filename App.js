/** export to  src/App */
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Baloo2_400Regular,
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
} from "@expo-google-fonts/baloo-2";
import {
  BaiJamjuree_400Regular,
  BaiJamjuree_500Medium,
  BaiJamjuree_600SemiBold,
  BaiJamjuree_700Bold,
} from "@expo-google-fonts/bai-jamjuree";
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";

import App from "./src/App";

export default function Root() {
  const [loaded] = useFonts({
    Baloo2_400Regular,
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    BaiJamjuree_400Regular,
    BaiJamjuree_500Medium,
    BaiJamjuree_600SemiBold,
    BaiJamjuree_700Bold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });
  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <App />
    </SafeAreaProvider>
  );
}
