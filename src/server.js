const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./config/db.config");
const routes = require("./routes");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", routes);

app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Welcome to Todoboard APIs!",
  });
});

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
