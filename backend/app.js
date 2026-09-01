const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/properties");
const messageRoutes = require("./routes/messages");
const requestRoutes = require("./routes/requests");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payments");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests (curl, Render health checks) and listed origins
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use((req, res, next) => {
  const contentType = String(req.headers["content-type"] || "");

  if (req.method !== "POST" && req.method !== "PUT" && req.method !== "PATCH") {
    return next();
  }

  if (!contentType.includes("text/plain")) {
    return next();
  }

  let rawBody = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    rawBody += chunk;
  });
  req.on("end", () => {
    try {
      req.body = rawBody ? JSON.parse(rawBody) : {};
    } catch (error) {
      req.body = rawBody ? { raw: rawBody } : {};
    }
    next();
  });
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CasaConnect backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CasaConnect Backend API is running",
    version: "1.0.0",
  });
});

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/messages", messageRoutes);
app.use("/requests", requestRoutes);
app.use("/admin", adminRoutes);
app.use("/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
