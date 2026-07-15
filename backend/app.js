const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const loanRoutes = require("./routes/loanRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "https://ledgerbook-2-z9t9.onrender.com/")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
