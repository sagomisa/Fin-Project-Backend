const mongoose = require("mongoose");

const blogSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
    }
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
