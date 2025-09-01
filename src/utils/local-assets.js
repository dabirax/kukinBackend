
// reads in the cloudinary env variable put this before
require("dotenv").config();
const cloudinary = require("../config/cloudinary")

const path = require("path");

console.log(cloudinary.config().cloud_name);

const imagePath = path.join(__dirname, "../../assets/egusi.jpg");

cloudinary.uploader
  .upload(imagePath, {
    resource_type: "image",
  })
  .then((result) => {
    console.log("success", JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.log("error", JSON.stringify(error, null, 2));
  });