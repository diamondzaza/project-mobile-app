/** ไฟล์รวม export barrel ของ screen ทั้งหมด — lazy load เพื่อลดงาน main-thread ตอนเปิดแอป */
import { lazy } from "react";

export const WelcomeScreen = lazy(() => import("./WelcomeScreen"));
export const LoginScreen = lazy(() => import("./LoginScreen"));
export const RegisterScreen = lazy(() => import("./RegisterScreen"));
export const HomeScreen = lazy(() => import("./HomeScreen"));
export const AddPetScreen = lazy(() => import("./AddPetScreen"));
export const PetProfileScreen = lazy(() => import("./PetProfileScreen"));
export const EditPetScreen = lazy(() => import("./EditPetScreen"));
export const WeightScreen = lazy(() => import("./WeightScreen"));
export const HealthScreen = lazy(() => import("./HealthScreen"));
export const PetAppointmentsScreen = lazy(() => import("./PetAppointmentsScreen"));
export const FoodScreen = lazy(() => import("./FoodScreen"));
export const ActivityScreen = lazy(() => import("./ActivityScreen"));
export const NotesScreen = lazy(() => import("./NotesScreen"));
export const NotificationsScreen = lazy(() => import("./NotificationsScreen"));
export const OverallAppointmentsScreen = lazy(() => import("./OverallAppointmentsScreen"));
export const UserProfileScreen = lazy(() => import("./UserProfileScreen"));
export const EditProfileScreen = lazy(() => import("./EditProfileScreen"));
export const SetupScreen = lazy(() => import("./SetupScreen"));
export const SubscriptionScreen = lazy(() => import("./SubscriptionScreen"));

/** โหลด chunk ของทุกหน้าล่วงหน้าในพื้นหลัง (เรียกหลังแอปพร้อม ~1 วิ)
 *  ทำให้กดเปลี่ยนหน้าได้ทันที โดยยังคงเริ่มแอปเร็วเพราะงานประมวลผลถูกเลื่อนออกไป */
export function preloadScreens() {
  const loaders = [
    import("./WelcomeScreen"),
    import("./LoginScreen"),
    import("./RegisterScreen"),
    import("./HomeScreen"),
    import("./AddPetScreen"),
    import("./PetProfileScreen"),
    import("./EditPetScreen"),
    import("./WeightScreen"),
    import("./HealthScreen"),
    import("./PetAppointmentsScreen"),
    import("./FoodScreen"),
    import("./ActivityScreen"),
    import("./NotesScreen"),
    import("./NotificationsScreen"),
    import("./OverallAppointmentsScreen"),
    import("./UserProfileScreen"),
    import("./EditProfileScreen"),
    import("./SetupScreen"),
    import("./SubscriptionScreen"),
  ];
  return Promise.allSettled(loaders);
}
