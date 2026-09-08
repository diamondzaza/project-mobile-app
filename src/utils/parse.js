// แยกตัวเลขจากข้อความ 

export function parseGrams(text) {
  if (!text) return null;
  const m = String(text).match(/(\d+(?:\.\d+)?)\s*(?:กรัม|grams?|grs?|g)(?![a-z])/i);
  return m ? Math.round(parseFloat(m[1]) * 100) / 100 : null;
}


export function parseMinutes(text) {
  if (!text) return null;
  const s = String(text);
  const h = s.match(/(\d+(?:\.\d+)?)\s*(?:ชั่วโมง|hours?|hrs?|h)(?![a-z])/i);
  const m = s.match(/(\d+(?:\.\d+)?)\s*(?:นาที|min(?:ute)?s?|m)(?![a-z])/i);
  const mins = (h ? parseFloat(h[1]) * 60 : 0) + (m ? parseFloat(m[1]) : 0);
  return mins > 0 ? Math.round(mins) : null;
}


export function minutesLabel(mins) {
  if (mins == null) return "—";
  if (mins < 60) return `${Math.round(mins)} นาที`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
}
