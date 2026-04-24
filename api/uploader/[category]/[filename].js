const BLOB_BASE_URL = 'https://ymwjzttutktscbre.public.blob.vercel-storage.com';

module.exports = async function handler(req, res) {
  try {
    const category = String(req.query.category || '').toLowerCase();
    const filename = String(req.query.filename || '');

    if (!category || !filename) {
      return res.status(404).json({
        status: false,
        message: 'File tidak ditemukan.'
      });
    }

    const allowed = ['image', 'video', 'audio', 'file'];

    if (!allowed.includes(category)) {
      return res.status(400).json({
        status: false,
        message: 'Kategori tidak valid.'
      });
    }

    const blobUrl = `${BLOB_BASE_URL}/${category}/${encodeURIComponent(filename)}`;

    return res.redirect(302, blobUrl);
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: 'Gagal membuka file.',
      error: err.message
    });
  }
};