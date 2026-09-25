/** แพ็กเกจสมาชิก (subscriptions) — tier ปัจจุบัน + สมัคร/ยกเลิก */
import { supabase } from "../supabase";

/**
 * โหลดแพ็กเกจปัจจุบันของผู้ใช้
 * @returns {Promise<{tier: string, periodEnd: string|null}>} ไม่มีแถว/หมดอายุ = 'standard'
 */
export async function loadSubscription(userId) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;

  if (data && data.status === "active" && (!data.period_end || new Date(data.period_end) > new Date())) {
    return { tier: data.tier, periodEnd: data.period_end ?? null };
  }
  return { tier: "standard", periodEnd: null };
}

/**
 * เปิดใช้แพ็กเกจ (โหมดชำระเงินจำลอง — gateway จริงควรเขียนจาก webhook)
 * @param {string} tier 'standard' | 'plus' | 'premium'
 * @param {number|null} days ระยะเวลา (วัน) — null = ตลอดชีพ
 */
export async function activateSubscription(userId, tier, { days = 30, paymentRef = "mock" } = {}) {
  const periodEnd = days == null ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      tier,
      status: "active",
      period_start: new Date().toISOString(),
      period_end: periodEnd,
      payment_ref: paymentRef,
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

/** ยกเลิก — กลับเป็น standard ทันที */
export async function cancelSubscription(userId) {
  await activateSubscription(userId, "standard", { days: null, paymentRef: "cancelled" });
}
