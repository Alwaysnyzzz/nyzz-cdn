module.exports = async function handler(req, res) {
  return res.status(200).json({
    status: true,
    message: 'Nyzz CDN Uploader aktif.',
    endpoints: {
      image: '/api/uploader/image',
      video: '/api/uploader/video',
      audio: '/api/uploader/audio',
      file: '/api/uploader/file'
    }
  });
};