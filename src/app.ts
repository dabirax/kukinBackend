const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const productRouter = require("./routes/product.route");
const uploadRoutes = require("./routes/upload.route");
const authRouter = require("./routes/auth.route");
const cartRouter = require("./routes/cart.route");
const articleRouter = require("./routes/article.route");
const errorHandler = require("./middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = String(
  process.env.CORS_ORIGINS || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin: any, callback: any) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
  })
);
app.use(bodyParser.json({ limit: "1mb" }));

app.use("/api/products", productRouter);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/articles", articleRouter);

app.get("/api", (_req: any, res: any) =>
  res.json({ status: "ok", service: "kukin-backend" })
);

const swaggerDocument = YAML.load("./src/docs/swagger.yaml");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req: any, res: any) => {
  res.status(404).json({
    message: "Resource not found",
    code: "NOT_FOUND",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

module.exports = app;
