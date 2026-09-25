/** ไฟล์รวม export barrel ของ screen ทั้งหมด — lazy load เพื่อลดงาน main-thread ตอนเปิดแอป */
import { lazy } from "react";

export const WelcomeScreen = lazy(() => import("./WelcomeScreen"));
export const LoginScreen = lazy(() => import("./LoginScreen"));
export const RegisterScreen = lazy(() => import("./RegisterScreen"));
export const HomeScreen = lazy(() => import("./HomeScreen"));
export const AddPetScreen = lazy(() => import("./AddPetScreen"));
export const PetProfileScreen = lazy(() => import("./PetProfileScreen"));
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
