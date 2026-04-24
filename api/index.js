module.exports = async function handler(req, res) {
  return res.status(200).json({
    status: true,
    message: 'Api CDN Aktif Silahkan Panduan Pemakaian Di api.nyzz.my.id'
  });
};