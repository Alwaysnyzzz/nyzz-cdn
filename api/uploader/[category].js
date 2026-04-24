const formidable = require('formidable');
const fs = require('fs/promises');
const { validateFile, genId, uploadToGithub, publicUrl } = require('../_lib/cdn');

module.exports.config = {
  api: {
    bodyParser: false
  }
};

function parseForm(req) {
  const form = formidable({ multiples: false, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

function getSingleFile(files) {
  let file = files.file;
  if (Array.isArray(file)) file = file[0];
  return file;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: false, message: 'Method tidak diizinkan.' });
  }

  try {
    const category = String(req.query.category || '').toLowerCase();
    const { files } = await parseForm(req);
    const file = getSingleFile(files);
    const { cfg, size, ext } = validateFile(category, file);

    const id = genId(cfg.prefix);
    const filename = id + ext;
    const buffer = await fs.readFile(file.filepath);

    await uploadToGithub(category, filename, buffer);

    return res.status(200).json({
      status: true,
      message: 'Upload berhasil.',
      data: {
        id,
        view_url: publicUrl(category, filename),
        filename,
        size
      }
    });
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: err.message || 'Upload gagal.'
    });
  }
};