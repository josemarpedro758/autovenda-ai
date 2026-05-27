const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.get("/", (req, res) => {
  res.send("AutoVenda IA Online 🚀");
});

app.listen(3000, () => {
  console.log("Servidor online");
});