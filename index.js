const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

app.get("/", (req, res) => {
  res.send("AutoVenda IA Online 🚀");
});

app.post("/webhook", async (req, res) => {

  try {

    const message =
      req.body.data?.message?.conversation || "";

    const remoteJid =
      req.body.data?.key?.remoteJid || "";

    if (!message) {
      return res.sendStatus(200);
    }

    console.log("Mensagem:", message);

    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "content:
"Você é a AutoVenda IA, uma atendente virtual extremamente profissional, humana, inteligente e persuasiva. Você conversa naturalmente com clientes do Brasil e Angola usando linguagem simples, amigável e convincente. Seu objetivo é vender produtos, responder dúvidas, manter o cliente interessado e fechar vendas. Nunca diga que é robô ou inteligência artificial. Sempre fale como uma atendente humana premium. Seja simpática, rápida, estratégica e natural."},
          {
            role: "user",
            content: message
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const resposta =
      aiResponse.data.choices[0].message.content;

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

app.listen(3000, () => {
  console.log("AutoVenda IA Online 🚀");
});
