export default async function handler(req, res) {
  // حذف /api/proxy از ابتدای مسیر
  const pathAndQuery = req.url.replace(/^\/api\/proxy/, '');
  const targetUrl = `https://generativelanguage.googleapis.com${pathAndQuery}`;

  const headers = { ...req.headers };
  delete headers.host;
  delete headers['content-length'];
  delete headers['x-forwarded-for'];
  delete headers['x-real-ip'];

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();

    for (const [key, value] of response.headers.entries()) {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
