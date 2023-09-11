const mongoose = require("mongoose");

const GalleryImageSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageURL: {
      type: String,
      required: [true, "Please add a photo"]
    }
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const GalleryImage = mongoose.model("GalleryImage", GalleryImageSchema);

module.exports = GalleryImage;
