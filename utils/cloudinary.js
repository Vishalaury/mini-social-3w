const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadSocialPostImage = (filePath, isPublic = true) => {
  return cloudinary.uploader.upload(filePath, { resource_type: "image", folder: "social_posts", overwrite: true });
};

const uploadSocialPostVideo = (filePath, isPublic = true) => {
  return cloudinary.uploader.upload(filePath, { resource_type: "video", folder: "social_posts", overwrite: true });
};

module.exports = { uploadSocialPostImage, uploadSocialPostVideo };
