module.exports = async function handler(req, res) {
  return res.status(200).json({
    status: true,
    message: 'Api Hidup Silahkan Mulai Upload',
    endpoints: {
      image: '/api/uploader/image',
      video: '/api/uploader/video',
      audio: '/api/uploader/audio',
      file: '/api/uploader/file'
    }
  });
};