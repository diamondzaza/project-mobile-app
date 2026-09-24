// Edge Function: reminder-cron
// หน้าที่: (1) เรียก generate_daily_reminders() สร้าง notification ใน DB
//         (2) ส่ง push ผ่าน Expo Push API เฉพาะ notification ที่ server สร้าง (origin='server')
//             แล้ว mark pushed_at กันส่งซ้ำ และลบ device token ที่หมดอายุ
// Deploy (ต้องทำเอง): npx supabase functions deploy reminder-cron
// Trigger: pg_cron ทุก 30 นาที (ดู migrations/0003_notifications_push.sql)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // service role: bypass RLS ได้เพราะรันบน server เรา
  );

  // 1) สร้าง notification จาก settings (มื้อ/เดิน/โน้ต)
  const { error: genError } = await supabase.rpc("generate_daily_reminders");
  if (genError) {
    return new Response(JSON.stringify({ ok: false, step: "generate", error: genError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2) หา notification ที่ server สร้างและยังไม่เคย push (pushed_at IS NULL)
  const { data: fresh, error: notifError } = await supabase
    .from("notifications")
    .select("id, user_id, kind, title, body, screen")
    .eq("origin", "server")
    .is("pushed_at", null)
    .order("fired_at", { ascending: false })
    .limit(200);
  if (notifError) {
    return new Response(JSON.stringify({ ok: false, step: "fetch", error: notifError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  type Message = { to: string; title: string; body: string; data: Record<string, unknown> };
  const messages: Message[] = [];
  const tokenToNotifs = new Map<string, string[]>(); // token -> notification ids ที่จะ mark

  for (const n of fresh ?? []) {
    const { data: devices } = await supabase
      .from("devices")
      .select("expo_push_token")
      .eq("user_id", n.user_id)
      .like("expo_push_token", "Expo%"); // token จริงจาก expo-notifications เท่านั้น
    for (const d of devices ?? []) {
      messages.push({
        to: d.expo_push_token,
        title: n.title,
        body: n.body ?? "",
        data: { screen: n.screen, notificationId: n.id },
      });
      tokenToNotifs.set(d.expo_push_token, [...(tokenToNotifs.get(d.expo_push_token) ?? []), n.id]);
    }
  }

  let pushed = 0;
  const deadTokens: string[] = [];
  if (messages.length > 0) {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });
    if (res.ok) {
      pushed = messages.length;
      // Expo ตอบเป็น ticket ต่อข้อความ — จับ token ที่ DeviceNotRegistered เพื่อลบทิ้ง
      try {
        const body = await res.json();
        const tickets: { status: string; details?: { error?: string } }[] = body.data ?? [];
        let i = 0;
        for (const m of messages) {
          const ticket = tickets[i++];
          if (ticket?.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
            deadTokens.push(m.to);
          }
        }
      } catch {
        // parse ไม่ได้ก็ข้าม — push หลักสำเร็จแล้ว
      }
    }
  }

  // 3) mark pushed_at ให้ notification ที่ส่งแล้ว (กัน cron รอบหน้าส่งซ้ำ)
  const allPushedNotifIds = [...new Set([...tokenToNotifs.values()].flat())];
  if (allPushedNotifIds.length > 0) {
    await supabase
      .from("notifications")
      .update({ pushed_at: new Date().toISOString() })
      .in("id", allPushedNotifIds);
  }

  // 4) ลบ token ที่หมดอายุ/ไม่ถูกต้องออกจาก devices
  for (const token of deadTokens) {
    await supabase.from("devices").delete().eq("expo_push_token", token);
  }

  return new Response(JSON.stringify({ ok: true, generated: fresh?.length ?? 0, pushed, deadTokens: deadTokens.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
