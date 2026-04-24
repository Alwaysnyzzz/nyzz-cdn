const BLOB_BASE_URL = 'https://ymwjzttutktscbre.public.blob.vercel-storage.com';

module.exports = async function handler(req, res) {
  try {
    const filename = String(req.query.filename || '');

    if (!filename) {
      return res.status(404).json({
        status: false,
        message: 'File tidak ditemukan.'
      });
    }

    const blobUrl = `${BLOB_BASE_URL}/tiktok-video/${encodeURIComponent(filename)}`;

    const response = await fetch(blobUrl);

    if (!response.ok) {
      return res.status(404).json({
        status: false,
        message: 'File tidak ditemukan.'
      });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const buffer = Buffer.from(await response.arrayBuffer());
    return res.status(200).send(buffer);

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: 'Gagal ambil video',
      error: err.message
    });
  }
};