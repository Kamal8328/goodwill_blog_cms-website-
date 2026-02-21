require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const categoryRoutes = require("./routes/categoryRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const clientRoutes = require("./routes/clientRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const tagRoutes = require("./routes/tagRoutes");


console.log("cloud name:" )
const connectDB = require("./config/db");

const app = express();

// connect database
connectDB();

// security middlewares
app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL, // Allow your frontend domain
  credentials: true
}));

// rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// routes
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/tags", require("./routes/tagRoutes"));
app.use("/api/media",require("./routes/mediaRoutes"))



// test route
app.get("/", (req, res) => {
  res.send("Blog CMS API Running 🚀");
});

app.listen(process.env.PORT || 5000, () =>
  console.log("🚀 Server running on port 5000")
);
