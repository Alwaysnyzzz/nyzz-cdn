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
body{
  background:#07070f;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  font-family:Arial,sans-serif;
  padding:24px;
  color:#fff
}
.welcome{
  font-size:clamp(22px,5vw,36px);
  font-weight:800;
  margin-bottom:8px;
  text-align:center
}
.welcome span{color:#a78bfa}
.sub{
  font-size:13px;
  color:#8888a8;
  margin-bottom:32px;
  text-align:center
}
.card{
  background:#0d0d1a;
  border:1px solid #ffffff14;
  border-radius:18px;
  padding:24px 22px;
  width:100%;
  max-width:620px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  box-shadow:0 0 40px rgba(108,92,231,.1)
}
.left{
  display:flex;
  align-items:center;
  gap:14px;
  min-width:0
}
.file-icon{
  width:46px;
  height:46px;
  border-radius:14px;
  background:rgba(167,139,250,.12);
  border:1px solid rgba(167,139,250,.22);
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0
}
.file-icon svg{
  width:24px;
  height:24px;
  stroke:#a78bfa;
  fill:none;
  stroke-width:2;
  stroke-linecap:round;
  stroke-linejoin:round
}
.file-info{min-width:0}
.file-name{
  font-size:14px;
  font-weight:800;
  color:#ededf5;
  word-break:break-all
}
.file-size{
  font-size:12px;
  color:#8888a8;
  margin-top:4px
}
.dl-btn{
  width:58px;
  height:58px;
  background:linear-gradient(135deg,#6c5ce7,#a78bfa);
  border:none;
  border-radius:16px;
  color:#fff;
  text-decoration:none;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  box-shadow:0 12px 28px rgba(108,92,231,.25)
}
.dl-btn:hover{opacity:.9}
.dl-btn svg{
  width:26px;
  height:26px;
  stroke:#fff;
  fill:none;
  stroke-width:2.4;
  stroke-linecap:round;
  stroke-linejoin:round
}
.footer{
  margin-top:32px;
  font-size:12px;
  color:#44445a;
  text-align:center;
  line-height:1.6
}
.footer a{color:#6c5ce7;text-decoration:none}
</style>
</head>
<body>

<div class="welcome">Welcome To <span>NyzzApi</span> Uploader</div>
<div class="sub">File kamu siap untuk diunduh.</div>

<div class="card">
  <div class="left">
    <div class="file-icon">
      <svg viewBox="0 0 24 24">
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/>
        <path d="M14 2v5h5"/>
        <path d="M9 13h6"/>
        <path d="M9 17h4"/>
      </svg>
    </div>
    <div class="file-info">
      <div class="file-name">${safeName}</div>
      <div class="file-size">Klik tombol download untuk mengunduh file</div>
    </div>
  </div>

  <a class="dl-btn" href="${rawUrl}" download="${safeName}" title="Download">
    <svg viewBox="0 0 24 24">
      <path d="M12 3v11"/>
      <path d="M7 10l5 5 5-5"/>
      <path d="M5 21h14"/>
      <path d="M5 17v4"/>
      <path d="M19 17v4"/>
    </svg>
  </a>
</div>

<div class="footer">
  Powered by <a href="https://api.nyzz.my.id">NyzzAPI</a> &mdash; Made with <span style="color:#ef4444">♥</span> by <a href="https://t.me/DzzXNzz">@DzzXNzz</a><br>
  © 2026 NyzzAPI
</div>

</body>
</html>`);
};