const BLOB_BASE_URL = 'https://ymwjzttutktscbre.public.blob.vercel-storage.com';

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));
}

module.exports = async function handler(req, res) {
  const filename = String(req.query.filename || '');

  if (!filename) {
    return res.status(404).send('File tidak ditemukan.');
  }

  const safeName = escapeHtml(filename);
  const rawUrl = `${BLOB_BASE_URL}/file/${encodeURIComponent(filename)}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeName} — NyzzAPI</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#07070f;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Arial,sans-serif;padding:24px;color:#fff}
.welcome{font-size:clamp(22px,5vw,36px);font-weight:800;margin-bottom:8px;text-align:center}
.welcome span{color:#a78bfa}
.sub{font-size:13px;color:#8888a8;margin-bottom:32px;text-align:center}
.card{background:#0d0d1a;border:1px solid #ffffff14;border-radius:18px;padding:24px 22px;width:100%;max-width:440px;display:flex;align-items:center;justify-content:space-between;gap:16px;box-shadow:0 0 40px rgba(108,92,231,.1)}
.file-name{font-size:14px;font-weight:700;color:#ededf5;word-break:break-all}
.file-size{font-size:12px;color:#8888a8;margin-top:3px}
.dl-btn{background:linear-gradient(135deg,#6c5ce7,#a78bfa);border:none;border-radius:10px;padding:12px 16px;color:#fff;text-decoration:none;font-weight:700}
.footer{margin-top:32px;font-size:12px;color:#44445a;text-align:center}
.footer a{color:#6c5ce7;text-decoration:none}
</style>
</head>
<body>
<div class="welcome">Welcome To <span>NyzzApi</span> Uploader</div>
<div class="sub">File kamu siap untuk diunduh.</div>
<div class="card">
  <div>
    <div class="file-name">${safeName}</div>
    <div class="file-size">Klik tombol untuk mengunduh file</div>
  </div>
  <a class="dl-btn" href="${rawUrl}" download="${safeName}">Download</a>
</div>
<div class="footer">Powered by <a href="https://api.nyzz.my.id">NyzzAPI</a> &mdash; Made with ❤️ by <a href="https://t.me/DzzXNzz">@DzzXNzz</a><br>© 2026 NyzzAPI</div>
</body>
</html>`);
};