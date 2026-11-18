const VENUE_NAME = "باغ‌تالار پامچال شاندیز";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "فقط درخواست POST پذیرفته می‌شود." });
  }
  const { question, name, telegram } = req.body || {};
  const cleanQuestion = String(question || "").trim().slice(0, 1200);
  const cleanName = String(name || "").trim().slice(0, 80);
  const cleanTelegram = String(telegram || "").trim().replace(/^@/, "").slice(0, 80);
  if (!cleanQuestion || !cleanTelegram || !/^[A-Za-z0-9_]{5,32}$/.test(cleanTelegram)) {
    return res.status(400).json({ error: "لطفاً سؤال و آیدی معتبر تلگرام (بدون رمز عبور) را وارد کنید." });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_OWNER_CHAT_ID;
  if (!token || !chatId) {
    return res.status(503).json({ error: "ثبت درخواست هنوز به تلگرام مدیریت متصل نشده است. لطفاً فعلاً با شماره ۰۹۱۵۳۶۹۶۹۴۹ تماس بگیرید." });
  }
  const message = [
    "📩 درخواست پاسخ‌گویی جدید — " + VENUE_NAME,
    "نام مشتری: " + (cleanName || "ثبت نشده"),
    "تلگرام مشتری: @" + cleanTelegram,
    "سؤال: " + cleanQuestion,
    "برای پاسخ، از طریق تلگرام با مشتری تماس بگیرید."
  ].join("\n");
  try {
    const response = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, disable_web_page_preview: true })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error("Telegram delivery failed");
    return res.status(200).json({ ok: true, message: "درخواست شما برای مدیریت پامچال ارسال شد. پس از بررسی، پاسخ از طریق تلگرام برایتان فرستاده می‌شود. سپاس از اعتمادتان 🌿" });
  } catch (error) {
    return res.status(502).json({ error: "ارسال درخواست انجام نشد. لطفاً دوباره تلاش کنید یا با مجموعه تماس بگیرید." });
  }
}