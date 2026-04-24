const path = require('path');
const mime = require('mime-types');
const { fetchFromGithub } = require('../../../_lib/cdn');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ status: false, message: 'Method tidak diizinkan.' });

  const filename = path.basename(String(req.query.filename || ''));
  if (!filename) return res.status(404).send('File tidak ditemukan.');

  try {
    const response = await fetchFromGithub('file', filename);
    if (response.status !== 200) return res.status(404).send('File tidak ditemukan.');

    const buffer = Buffer.from(response.data);

    res.setHeader('Content-Type', mime.lookup(filename) || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).send('Gagal mengambil file.');
  }
};