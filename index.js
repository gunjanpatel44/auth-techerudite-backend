const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const router = require("./api/routes");
const sequelize = require("./config/db");
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.status(200).json("Welcome to Techerudite API");
});
app.use("/api", router);
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    message: error.message || "Internal Server Error",
    status: error.status || 500,
  });
});

app.listen(port, () => {
  console.log(`Server is up and running at port ${port}`);
});

sequelize
  .authenticate()
  .then(() => {
    console.log("DB connected");
    return sequelize.sync();
  })
  .then(() => console.log("DB synced"))
  .catch((err) => console.error("DB sync error:", err.message));
