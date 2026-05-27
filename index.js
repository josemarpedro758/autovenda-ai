const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const conversations = {};

const products = [

  {
    name: "Tênis Nike Air",
    price: "45.000 Kz",
    description:
      "Tênis premium confortável, estiloso e resistente."
  },

  {
    name: "iPhone 13 Pro",
    price: "650.000 Kz",
    description:
      "Smartphone premium da Apple com câmera profissional."
  },

  {
    name: "Fone Bluetooth",
    price: "15.000 Kz",
    description:
      "Fone sem fio com som de alta qualidade."
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

    if (!conversations[remoteJid]) {

      conversations[remoteJid] = [
        {
          role: "system",
          content:
`Você é a AutoVenda IA, uma atendente virtual extremamente profissional, humana, simpática, estratégica e especialista em vendas automáticas no WhatsApp.

Você conversa naturalmente com clientes de Angola e do Brasil usando linguagem humana, amigável e convincente.

Você deve agir como uma vendedora premium extremamente inteligente.

Esses são os produtos disponíveis:

${products.map(product =>
`Produto: ${product.name}
Preço: ${product.price}
Descrição: ${product.description}`
).join("\n\n")}

REGRAS IMPORTANTES:

- Sempre tente fechar a venda.
- Seja natural e humana.
- Nunca diga que é inteligência artificial.
- Sempre recomende produtos.
- Crie urgência moderada.
- Destaque benefícios.
- Incentive pagamento na entrega.
- Mantenha o cliente interessado.
- Seja persuasiva sem parecer forçada.
- Responda de forma curta, elegante e profissional.
- Use emojis moderadamente.
- Faça o cliente sentir confiança.

Seu objetivo principal é vender.`
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

    console.log("Resposta IA:", resposta);

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
