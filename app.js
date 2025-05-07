require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const sequelize = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: "*",
};

app.use("/uploads", cors(corsOptions), express.static("uploads"));

app.use((req, res, next) => {
  const allowedOrigins = "*";
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "x-www-form-urlencoded, Origin, X-Requested-With, Content-Type, Accept, Authorization, *"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  next();
});

app.get("/", (req, res) => {
  res.json({
    Devdoot: "Welcome, Server is Working!",
  });
});

app.use("/users", userRoutes);

// Catch-all route should be last
// app.get("*", (req, res) => {
//   return res.status(404).json({
//     status: false,
//     message: "Route not found !",
//   });
// });

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });
    console.log("✅ Database connected and synced");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Unable to connect to the database:", err);
  }
})();

