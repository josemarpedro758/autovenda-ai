const express = require("express");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const products = [
  {
    id: 1,
    name: "Tênis Nike Air",
    price: "45.000 Kz",
    description: "Tênis premium confortável.",
    image:
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  },

  {
    id: 2,
    name: "iPhone 13 Pro",
    price: "650.000 Kz",
    description: "iPhone premium Apple.",
    image:
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  }
];

const clients = [];

app.get("/", (req, res) => {

  res.send("AutoVenda IA Online 🚀");

});

app.get("/admin/products", (req, res) => {

  res.json(products);

});

app.get("/admin/clients", (req, res) => {

  res.json(clients);

});

app.get("/upload", async (req, res) => {

  try {

    const uploadResult =
      await cloudinary.uploader.upload(
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        {
          folder: "autovendaia"
        }
      );

    return res.json({
      success: true,
      image: uploadResult.secure_url
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `AutoVenda IA Online na porta ${PORT}`
  );

});
