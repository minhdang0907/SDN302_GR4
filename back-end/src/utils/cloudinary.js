const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: 'dzkl4pzbi',
    api_key: '326717636746418   ',
    api_secret: '0qBo4P6os6wOWY05M7g4zvRNuDA',
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };