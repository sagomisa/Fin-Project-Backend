const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const cloudinary = require('cloudinary').v2;

//Create Blog
const createBlog = async (req, res) => {
  try {
    const {  id, title, content } = req.body;
    // Validation
    if (!title || !content) {
      res.status(400);
      throw new Error("Please fill in all the required fields.");
    }

    const user = await User.findById(id);

    // Upload image to Cloudinary
    let imageURL = '';
    if (req.file) {
      imageURL = await uploadImageToCloudinary(req.file.buffer);
    }
    const blog = new Blog({
      title,
      content,
      author: user,
      imageURL
    });

    // Save the blog to the database
    const newBlog = await blog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message });
  }
};

const uploadImageToCloudinary = async (imageBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'blog_images'},
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    ).end(imageBuffer);
  });
};

// Retrieve and return all blogs from the database.
const getAllBlogs = async (req, res) => {
  try {
    console.log("fetching all blogs")
    const blogs = await Blog.find({}).populate('author', 'name');;
    res.status(200).json(blogs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an Blog with the specified BlogId
const deleteBlog = async (req, res) => {
    try {
      const { id } = req.params;
      await Blog.findByIdAndDelete(id);
      res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

// Find a single blog with a blogId
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate('author', 'name');
    res.status(200).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


module.exports = {
  createBlog,
  getAllBlogs,
  deleteBlog,
  getBlogById
};
