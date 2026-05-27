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

const conversations = {};
const followUps = {};
const clients = [];

const products = [

  {
    id: 1,
    name: "Tênis Nike Air",
    price: "45.000 Kz",
    description:
      "Tênis premium confortável, estiloso e resistente.",
    image:
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  },

  {
    id: 2,
    name: "iPhone 13 Pro",
    price: "650.000 Kz",
    description:
      "Smartphone premium da Apple com câmera profissional.",
    image:
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  }

];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

app.get("/", (req, res) => {
  res.send("AutoVenda IA Online 🚀");
});

app.get("/admin/products", (req, res) => {
  res.json(products);
});

app.get("/admin/clients", (req, res) => {
  res.json(clients);
});

app.post("/upload", async (req, res) => {

  try {

    const imageUrl =
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff";

    const uploadResult =
      await cloudinary.uploader.upload(
        imageUrl,
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
      success: false
    });

  }

});

app.post("/webhook", async (req, res) => {

  try {

    const message =
      req.body?.data?.message?.conversation || "";

    const remoteJid =
      req.body?.data?.key?.remoteJid || "";

    if (!message || !remoteJid) {
      return res.sendStatus(200);
    }

    const clientExists = clients.find(
      client => client.number === remoteJid
    );

    if (!clientExists) {

      clients.push({
        number: remoteJid,
        lastMessage: message,
        createdAt: new Date()
      });

    } else {

      clientExists.lastMessage = message;

    }

    if (followUps[remoteJid]) {
      clearTimeout(followUps[remoteJid]);
    }

    if (!conversations[remoteJid]) {

      conversations[remoteJid] = [
        {
          role: "system",
          content:
`Você é a AutoVenda IA, uma atendente virtual extremamente profissional e especialista em vendas automáticas.

Produtos disponíveis:

${products.map(product =>
`Produto: ${product.name}
Preço: ${product.price}
Descrição: ${product.description}`
).join("\n\n")}

Seu objetivo é vender produtos e convencer clientes naturalmente.`
        }
      ];

    }

    conversations[remoteJid].push({
      role: "user",
      content: message
    });

    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: conversations[remoteJid]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const resposta =
      openaiResponse.data.choices[0].message.content;

    conversations[remoteJid].push({
      role: "assistant",
      content: resposta
    });

    await axios.post(
      `${EVOLUTION_API_URL}/message/sendText/autovendaia`,
      {
        number: remoteJid,
        text: resposta
      },
      {
        headers: {
          apikey: EVOLUTION_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return res.sendStatus(200);

  } catch (error) {

    console.log(
      error?.response?.data || error.message
    );

    return res.sendStatus(500);

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AutoVenda IA Online na porta ${PORT}`);
});
