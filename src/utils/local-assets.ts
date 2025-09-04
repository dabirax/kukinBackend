require("dotenv").config({ path: "../../.env" });
const cloudinary = require("../config/cloudinary.ts");
const path = require("path");

// Load environment variables

console.log("Cloudinary config: ", cloudinary.config().cloud_name);

const imagePath = path.join(__dirname, "../../assets/okra.jpg");

cloudinary.uploader
  .upload(imagePath, {
    resource_type: "image",
    folder: "kukin",
  })
  .then((result: any) => {
    console.log("success", JSON.stringify(result, null, 2));
  })
  .catch((error: any) => {
    console.log("error", JSON.stringify(error, null, 2));
  });
