/** ui/Switch  */
import { Switch } from "react-native";

import { colors } from "../../theme";

export function ShadcnSwitch({ value, onValueChange, disabled }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: "rgba(122,92,66,0.25)", true: colors.greenDark }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="rgba(122,92,66,0.25)"
    />
  );
}

export default ShadcnSwitch;
