const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./config/db.config");
const routes = require("./routes");

const PORT = process.env.PORT || 3001;

const app = express();

const allowedOrigins = [
  "https://todoboard-admin.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api", routes);

app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Welcome to Todoboard APIs!",
  });
});

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
