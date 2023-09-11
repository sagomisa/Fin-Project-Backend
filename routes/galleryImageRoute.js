const express = require("express");
const multer = require('multer');
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
// const path = require("path");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// const upload = multer({ dest: 'uploads/' });

const upload = multer();

const {
  getAllGalleryImages,
  createGalleryImage
} = require("../controllers/galleryImageController");

router.get("/getAllGalleryImages", getAllGalleryImages);
router.post("/createGalleryImage",upload.single('image'), protect, adminOnly, createGalleryImage);


module.exports = router;
