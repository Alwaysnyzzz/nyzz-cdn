const path = require('path');
const mime = require('mime-types');
const { CONFIG, fetchFromGithub } = require('../../_lib/cdn');

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}

function fileCardHtml(filename, sizeMB) {
  const safeName = escapeHtml(filename);
  const fileUrl = `/api/uploader/file/raw/${encodeURIComponent(filename)}`;

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${safeName} — NyzzAPI</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#07070f;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Inter',sans-serif;padding:24px}.welcome{font-family:'Space Grotesk',sans-serif;font-size:clamp(22px,5vw,36px);font-weight:800;color:#fff;letter-spacing:-.5px;margin-bottom:8px;text-align:center}.welcome span{color:#a78bfa}.sub{font-size:13px;color:#8888a8;margin-bottom:32px;text-align:center}.card{background:#0d0d1a;border:1px solid #ffffff14;border-radius:18px;padding:24px 22px;width:100%;max-width:440px;display:flex;align-items:center;justify-content:space-between;gap:16px;box-shadow:0 0 40px rgba(108,92,231,.1)}.card-left{display:flex;align-items:center;gap:14px}.file-ico{width:44px;height:44px;border-radius:12px;background:rgba(108,92,231,.12);border:1px solid rgba(108,92,231,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0}.file-ico svg{width:22px;height:22px;stroke:#a78bfa;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.file-name{font-size:14px;font-weight:700;color:#ededf5;word-break:break-all}.file-size{font-size:12px;color:#8888a8;margin-top:3px}.dl-btn{background:linear-gradient(135deg,#6c5ce7,#a78bfa);border:none;border-radius:10px;padding:10px 14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .2s;text-decoration:none}.dl-btn:hover{opacity:.85}.dl-btn svg{width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.footer{margin-top:32px;font-size:12px;color:#44445a;text-align:center}.footer a{color:#6c5ce7;text-decoration:none}</style></head><body><div class="welcome">Welcome To <span>NyzzApi</span> Uploader</div><div class="sub">File kamu siap untuk diunduh.</div><div class="card"><div class="card-left"><div class="file-ico"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div><div class="file-name">${safeName}</div><div class="file-size">${sizeMB} MB</div></div></div><a class="dl-btn" href="${fileUrl}" download="${safeName}"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a></div><div class="footer">Powered by <a href="https://api.nyzz.my.id">NyzzAPI</a> &mdash; Made with ❤️ by <a href="https://t.me/DzzXNzz">@DzzXNzz</a><br>© 2026 NyzzAPI</div></body></html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ status: false, message: 'Method tidak diizinkan.' });

  const category = String(req.query.category || '').toLowerCase();
  const filename = path.basename(String(req.query.filename || ''));

  if (!CONFIG[category] || !filename) return res.status(404).json({ status: false, message: 'File tidak ditemukan.' });

  try {
    const response = await fetchFromGithub(category, filename);
    if (response.status !== 200) return res.status(404).json({ status: false, message: 'File tidak ditemukan.' });

    const buffer = Buffer.from(response.data);

    if (category === 'file') {
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.status(200).send(fileCardHtml(filename, sizeMB));
    }

    res.setHeader('Content-Type', mime.lookup(filename) || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).json({ status: false, message: 'Gagal mengambil file.' });
  }
};