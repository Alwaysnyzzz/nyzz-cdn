const axios = require('axios');
const path = require('path');
const mime = require('mime-types');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const CDN_BASE_URL = (process.env.CDN_BASE_URL || 'https://cdn.nyzz.my.id').replace(/\/$/, '');
const STORAGE_DIR = (process.env.GITHUB_STORAGE_DIR || 'uploads').replace(/^\/+|\/+$/g, '');

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const VIDEO_MIMES = ['video/mp4'];
const VIDEO_EXTS = ['.mp4'];
const AUDIO_MIMES = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/m4a', 'audio/ogg', 'application/ogg'];
const AUDIO_EXTS = ['.mp3', '.mp4', '.m4a', '.aac', '.ogg'];

const CONFIG = {
  image: { prefix: 'IMG', folder: 'image', maxSize: 20 * 1024 * 1024, mimes: IMAGE_MIMES, exts: IMAGE_EXTS },
  video: { prefix: 'VID', folder: 'video', maxSize: 100 * 1024 * 1024, mimes: VIDEO_MIMES, exts: VIDEO_EXTS },
  audio: { prefix: 'AUD', folder: 'audio', maxSize: 50 * 1024 * 1024, mimes: AUDIO_MIMES, exts: AUDIO_EXTS },
  file:  { prefix: 'FILE', folder: 'file', maxSize: 100 * 1024 * 1024, mimes: null, exts: null }
};

function assertEnv() {
  const missing = [];
  if (!GITHUB_TOKEN) missing.push('GITHUB_TOKEN');
  if (!GITHUB_OWNER) missing.push('GITHUB_OWNER');
  if (!GITHUB_REPO) missing.push('GITHUB_REPO');
  if (missing.length) throw new Error('Env belum lengkap: ' + missing.join(', '));
}

function genId(prefix, length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = prefix;
  for (let i = 0; i < length; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function safeExt(originalName = '', mimetype = '') {
  let ext = path.extname(originalName).toLowerCase();
  if (!ext && mimetype) {
    const guessed = mime.extension(mimetype);
    if (guessed) ext = '.' + guessed;
  }
  return ext;
}

function isForbiddenGeneralFile(mimetype, ext) {
  return IMAGE_MIMES.includes(mimetype) || VIDEO_MIMES.includes(mimetype) || AUDIO_MIMES.includes(mimetype) ||
    IMAGE_EXTS.includes(ext) || VIDEO_EXTS.includes(ext) || AUDIO_EXTS.includes(ext);
}

function validateFile(category, file) {
  const cfg = CONFIG[category];
  if (!cfg) throw new Error('Kategori uploader tidak valid.');
  if (!file) throw new Error('File tidak valid atau tidak disertakan.');

  const mimetype = file.mimetype || file.type || 'application/octet-stream';
  const size = Number(file.size || 0);
  const ext = safeExt(file.originalFilename || file.name || '', mimetype);

  if (!ext) throw new Error('File wajib memiliki ekstensi.');
  if (size > cfg.maxSize) throw new Error('Ukuran file terlalu besar.');

  if (category === 'file') {
    if (isForbiddenGeneralFile(mimetype, ext)) {
      throw new Error('Format ini sudah tersedia di endpoint image/video/audio, gunakan endpoint yang sesuai.');
    }
  } else {
    if (!cfg.mimes.includes(mimetype) && !cfg.exts.includes(ext)) {
      throw new Error('Maaf format tidak sesuai, silahkan ganti file atau ubah format!');
    }
  }

  return { cfg, mimetype, size, ext };
}

function githubPath(category, filename) {
  const folder = CONFIG[category].folder;
  return `${STORAGE_DIR}/${folder}/${filename}`.replace(/^\/+/, '');
}

async function uploadToGithub(category, filename, buffer) {
  assertEnv();

  const filePath = githubPath(category, filename);
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`;

  await axios.put(url, {
    message: `upload: ${filename}`,
    content: buffer.toString('base64'),
    branch: GITHUB_BRANCH
  }, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'nyzz-cdn-uploader'
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  return filePath;
}

function rawGithubUrl(filePath) {
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath.split('/').map(encodeURIComponent).join('/')}`;
}

async function fetchFromGithub(category, filename) {
  assertEnv();

  const filePath = githubPath(category, filename);
  const url = rawGithubUrl(filePath);

  return axios.get(url, {
    responseType: 'arraybuffer',
    validateStatus: () => true,
    headers: { 'User-Agent': 'nyzz-cdn-uploader' }
  });
}

function publicUrl(category, filename) {
  return `${CDN_BASE_URL}/api/uploader/${category}/${filename}`;
}

module.exports = {
  CONFIG,
  CDN_BASE_URL,
  validateFile,
  genId,
  uploadToGithub,
  fetchFromGithub,
  publicUrl,
  safeExt
};