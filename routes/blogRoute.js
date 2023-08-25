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
  getAllBlogs,
  createBlog,
  deleteBlog,
  getBlogById
} = require("../controllers/blogController");

router.get("/getAllBlogs", getAllBlogs);
router.post("/createBlog",upload.single('image'), protect, adminOnly, createBlog);
router.get("/getBlogById/:id", getBlogById);
// router.put("/updateEvent/:id", updateEvent);
router.delete("/deleteBlog/:id", deleteBlog)

module.exports = router;
