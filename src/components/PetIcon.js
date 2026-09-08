/** ไอคอนสัตว์เลี้ยง */
import { Dog, Cat, Rabbit, Bird, Turtle, Fish, PawPrint } from "lucide-react-native";

const PET_ICON_MAP = {
  dog: Dog,
  cat: Cat,
  rabbit: Rabbit,
  bird: Bird,
  turtle: Turtle,
  fish: Fish,
};

export default function PetIcon({ name, size = 24, color = "#A8552E", strokeWidth = 2, ...rest }) {
  const Icon = PET_ICON_MAP[name] || PawPrint;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
}
