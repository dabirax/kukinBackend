const dotenv = require("dotenv");
const connectDB = require("./db/connectDB");
const app = require("./app");

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect DB first, then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  });
