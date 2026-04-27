const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: 'dd4dumgcz',
  api_key: '693455241722777',
  api_secret: 'FLljfiYNs1tlprPoQ8XXtIB6Ri8',
});

module.exports = cloudinary;
