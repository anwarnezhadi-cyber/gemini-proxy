export default async function handler(req, res) {
  // گرفتن مسیر درخواست و حذف /api از ابتدای آن
  const pathAndQuery = req.url.replace(/^\/api/, '');
  const targetUrl = `https://generativelanguage.googleapis.com${pathAndQuery}`;

  // آماده‌سازی هدرها
  const headers = { ...req.headers };
  delete headers.host;
  delete headers['content-length'];
  delete headers['x-forwarded-for'];
  delete headers['x-real-ip'];

  try {
    // ارسال درخواست به گوگل
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // خواندن پاسخ به صورت متن
    const data = await response.text();

    // کپی کردن هدرهای پاسخ گوگل
    for (const [key, value] of response.headers.entries()) {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // ارسال پاسخ نهایی به ربات
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
