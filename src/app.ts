const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const productRouter = require("./routes/product.route");
const uploadRoutes = require("./routes/upload.route");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Product routes
app.use("/api/products", productRouter);

// Upload routes
app.use("/api/upload", uploadRoutes);

//Swagger Documentation
const swaggerDocument = YAML.load("./src/docs/swagger.yaml");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


module.exports = app;
