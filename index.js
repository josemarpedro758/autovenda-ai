const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const conversations = {};
const followUps = {};

const products = [

  {
    name: "Tênis Nike Air",
    price: "45.000 Kz",
    description:
      "Tênis premium confortável, estiloso e resistente.",
    image:
      "https://i.imgur.com/8Km9tLL.jpg"
  },

  {
    name: "iPhone 13 Pro",
    price: "650.000 Kz",
    description:
      "Smartphone premium da Apple com câmera profissional.",
    image:
      "https://i.imgur.com/ZANVnHE.jpg"
  },

  {
    name: "Fone Bluetooth",
    price: "15.000 Kz",
    description:
      "Fone sem fio com som de alta qualidade.",
    image:
      "https://i.imgur.com/QCNbOAo.jpg"
  }

];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

app.get("/", (req, res) => {
  res.send("AutoVenda IA Online 🚀");
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

    console.log("Mensagem recebida:", message);

    if (followUps[remoteJid]) {
      clearTimeout(followUps[remoteJid]);
    }

    if (!conversations[remoteJid]) {

      conversations[remoteJid] = [
        {
          role: "system",
          content:
`Você é a AutoVenda IA, uma atendente virtual extremamente profissional, humana e especialista em vendas automáticas.

Produtos disponíveis:

${products.map(product =>
`Produto: ${product.name}
Preço: ${product.price}
Descrição: ${product.description}`
).join("\n\n")}

Seu objetivo é vender produtos, convencer clientes e responder naturalmente como humana.

Sempre tente manter o cliente interessado.`
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

    const lowerMessage = message.toLowerCase();

    for (const product of products) {

      if (
        lowerMessage.includes(product.name.toLowerCase())
      ) {

        await axios.post(
          `${EVOLUTION_API_URL}/message/sendMedia/autovendaia`,
          {
            number: remoteJid,
            mediatype: "image",
            media: product.image,
            caption:
              `${product.name}\nPreço: ${product.price}`
          },
          {
            headers: {
              apikey: EVOLUTION_API_KEY,
              "Content-Type": "application/json"
            }
          }
        );

      }

    }

    followUps[remoteJid] = setTimeout(async () => {

      try {

        await axios.post(
          `${EVOLUTION_API_URL}/message/sendText/autovendaia`,
          {
            number: remoteJid,
            text:
              "Olá 😊 Só passando para saber se ainda tens interesse no produto. Posso te ajudar com mais alguma informação?"
          },
          {
            headers: {
              apikey: EVOLUTION_API_KEY,
              "Content-Type": "application/json"
            }
          }
        );

        console.log(
          "Follow-up enviado para:",
          remoteJid
        );

      } catch (error) {

        console.log(
          "Erro follow-up:",
          error?.response?.data || error.message
        );

      }

    }, 300000);

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
