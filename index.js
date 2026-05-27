const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.get("/", (req, res) => {
  res.send("AutoVenda IA Online 🚀");
});

app.post("/webhook", async (req, res) => {

  try {

    const message =
      req.body.data?.message?.conversation || "";

    if (!message) {
      return res.sendStatus(200);
    }

    console.log("Mensagem recebida:", message);

    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é a AutoVenda IA, uma atendente virtual profissional que vende produtos automaticamente, conversa naturalmente e responde clientes brasileiros e angolanos."
          },
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

    console.log("Resposta IA:", resposta);

    return res.status(200).json({
      reply: resposta
    });

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
