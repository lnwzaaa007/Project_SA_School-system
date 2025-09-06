
// แปลงวันที่ให้แสดงรูปแบบ "วันจันทร์ ที่ 07/09/2568 เวลา 01:05"
export const formatThaiDateTime = (input: any): string => {
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input ?? "");
    const dayNames = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    const day = dayNames[d.getDay()];
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear() + 543; // พ.ศ.
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `วัน${day} ที่ ${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch {
    return String(input ?? "");
  }
};