const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());

app.use(cors());
app.use(express.json());
// app.use("/", noteRoutes);
app.use(errorHandler);

// Parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;
