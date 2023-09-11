const User = require("../models/userModel");
const GalleryImage = require("../models/GalleryImageModel");
const cloudinary = require('cloudinary').v2;

//Create Blog
const createGalleryImage = async (req, res) => {
  try {
      const {  id } = req.body;
    // Validation
    if (!id || !req.file) {
      res.status(400);
      throw new Error("Please fill in all the required fields.");
    }

    const user = await User.findById(id);

    // Upload image to Cloudinary
    let imageURL = await uploadImageToCloudinary(req.file.buffer);
    const galleryImage = new GalleryImage({
      user,
      imageURL
    });

    // Save the galleryImage to the database
    const newGalleryImage = await galleryImage.save();
    res.status(201).json(newGalleryImage);
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message });
  }
};

const uploadImageToCloudinary = async (imageBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'gallery_images'},
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    ).end(imageBuffer);
  });
};

// Retrieve and return all gallery images from the database.
const getAllGalleryImages = async (req, res) => {
  try {
    const galleryImages = await GalleryImage.find({});
    res.status(200).json(galleryImages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createGalleryImage,
  getAllGalleryImages
};
