const express = require("express");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const { Pool } = require("pg");

const http = require("http");

const { Server } = require("socket.io");

require("dotenv").config();

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
  cors:{
    origin:"*"
  }
});

/* ======================================
CONFIG
====================================== */

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended:true
  })
);

app.use(
  express.static(
    path.join(__dirname)
  )
);

/* ======================================
UPLOAD
====================================== */

const upload = multer({
  dest:"uploads/"
});

/* ======================================
DATABASE
====================================== */

const pool = new Pool({
  connectionString:
  process.env.DATABASE_URL,

  ssl:{
    rejectUnauthorized:false
  }
});

/* ======================================
CLOUDINARY
====================================== */

cloudinary.config({

  cloud_name:
  process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
  process.env.CLOUDINARY_API_KEY,

  api_secret:
  process.env.CLOUDINARY_API_SECRET

});

/* ======================================
AUTH
====================================== */

const SECRET_KEY =
"autovendaia_master_2026";

const adminUser = {

  email:
  "admin@autovendaia.com",

  password:
  bcrypt.hashSync(
    "123456",
    10
  )

};

/* ======================================
CREATE TABLES
====================================== */

async function createTables(){

  try{

    await pool.query(`

      CREATE TABLE IF NOT EXISTS products(

        id SERIAL PRIMARY KEY,

        name TEXT,

        price TEXT,

        description TEXT,

        image TEXT,

        type TEXT,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);

    await pool.query(`

  CREATE TABLE IF NOT EXISTS messages(

    id SERIAL PRIMARY KEY,

    number TEXT,

    message TEXT,

    response TEXT,

    created_at TIMESTAMP DEFAULT NOW()

  )

`);
    
    try{

  await pool.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS type TEXT
  `);

}catch(error){

  console.log(error);

}

    await pool.query(`

      CREATE TABLE IF NOT EXISTS clients(

        id SERIAL PRIMARY KEY,

        number TEXT UNIQUE,

        memory TEXT,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);

    console.log(
      "Banco conectado 🚀"
    );

  }catch(error){

    console.log(error);

  }

}

createTables();

/* ======================================
AUTH MIDDLEWARE
====================================== */

function authMiddleware(
  req,
  res,
  next
){

  const authHeader =
  req.headers.authorization;

  if(!authHeader){

    return res.status(401).json({
      success:false,
      error:"Token não enviado"
    });

  }

  const token =
  authHeader.split(" ")[1];

  try{

    jwt.verify(
      token,
      SECRET_KEY
    );

    next();

  }catch(error){

    return res.status(401).json({
      success:false,
      error:"Token inválido"
    });

  }

}

/* ======================================
ROTAS HTML
====================================== */

app.get("/",(req,res)=>{

  res.sendFile(
    path.join(
      __dirname,
      "index.html"
    )
  );

});

app.get("/login",(req,res)=>{

  res.sendFile(
    path.join(
      __dirname,
      "login.html"
    )
  );

});

app.get("/dashboard",(req,res)=>{

  res.sendFile(
    path.join(
      __dirname,
      "dashboard.html"
    )
  );

});

/* ======================================
LOGIN
====================================== */

app.post("/login",async(req,res)=>{

  try{

    const {
      email,
      password
    } = req.body;

    if(
      email !== adminUser.email ||
      !bcrypt.compareSync(
        password,
        adminUser.password
      )
    ){

      return res.status(401).json({
        success:false,
        error:"Credenciais inválidas"
      });

    }

    const token = jwt.sign(

      {
        email
      },

      SECRET_KEY,

      {
        expiresIn:"7d"
      }

    );

    return res.json({
      success:true,
      token
    });

  }catch(error){

    return res.status(500).json({
      success:false,
      error:error.message
    });

  }

});

/* ======================================
UPLOAD IMAGE
====================================== */

app.post(
  "/upload-image",

  upload.single("image"),

  async(req,res)=>{

    try{

      const result =
      await cloudinary.uploader.upload(
        req.file.path,
        {
          folder:"autovendaia"
        }
      );

      return res.json({
        success:true,
        url:result.secure_url
      });

    }catch(error){

      return res.status(500).json({
        success:false,
        error:error.message
      });

    }

  }
);

/* ======================================
GET PRODUCTS
====================================== */

app.get(
  "/admin/products",

  authMiddleware,

  async(req,res)=>{

    try{

      const result =
      await pool.query(
        "SELECT * FROM products ORDER BY id DESC"
      );

      return res.json(
        result.rows
      );

    }catch(error){

      return res.status(500).json({
        success:false,
        error:error.message
      });

    }

  }
);

/* ======================================
CREATE PRODUCT
====================================== */

app.post(
  "/admin/products",

  authMiddleware,

  async(req,res)=>{

    try{

      const {
        name,
        price,
        description,
        image,
        type
      } = req.body;

      const result =
      await pool.query(

        `
        INSERT INTO products
        (
          name,
          price,
          description,
          image,
          type
        )

        VALUES($1,$2,$3,$4,$5)

        RETURNING *
        `,

        [
          name,
          price,
          description,
          image,
          type
        ]

      );

      io.emit(
        "new-product",
        result.rows[0]
      );

      return res.json({
        success:true,
        product:result.rows[0]
      });

    }catch(error){

      return res.status(500).json({
        success:false,
        error:error.message
      });

    }

  }
);

/* ======================================
DELETE PRODUCT
====================================== */

app.delete(
  "/admin/products/:id",
  authMiddleware,
  async(req,res)=>{

    try{

      const { id } = req.params;

      await pool.query(
        "DELETE FROM products WHERE id=$1",
        [id]
      );

      return res.json({
        success:true
      });

    }catch(error){

      return res.status(500).json({
        success:false,
        error:error.message
      });

    }

  }
);

/* ======================================
UPDATE PRODUCT
====================================== */

app.put(
  "/admin/products/:id",
  authMiddleware,
  async(req,res)=>{

    try{

      const { id } = req.params;

      const {
        name,
        price,
        description,
        type
      } = req.body;

      const result =
      await pool.query(

        `
        UPDATE products

        SET
        name=$1,
        price=$2,
        description=$3,
        type=$4

        WHERE id=$5

        RETURNING *
        `,

        [
          name,
          price,
          description,
          type,
          id
        ]

      );

      return res.json({
        success:true,
        product:result.rows[0]
      });

    }catch(error){

      return res.status(500).json({
        success:false,
        error:error.message
      });

    }

  }
);

/* ======================================
ANALYTICS
====================================== */

app.get(
  "/admin/analytics",

  authMiddleware,

  async(req,res)=>{

    try{

      const productsCount =
      await pool.query(
        "SELECT COUNT(*) FROM products"
      );

      const clientsCount =
      await pool.query(
        "SELECT COUNT(*) FROM clients"
      );

      const recentProducts =
      await pool.query(
        "SELECT * FROM products ORDER BY id DESC LIMIT 5"
      );

      return res.json({

        success:true,

        products:
        Number(
          productsCount.rows[0].count
        ),

        clients:
        Number(
          clientsCount.rows[0].count
        ),

        messages:
        Number(
          clientsCount.rows[0].count
        ) * 8,

        revenue:
        Number(
          productsCount.rows[0].count
        ) * 250,

        recentProducts:
        recentProducts.rows

      });

    }catch(error){

      return res.status(500).json({
        success:false,
        error:error.message
      });

    }

  }
);

app.get(
  "/admin/clients",

  authMiddleware,

  async(req,res)=>{

    try{

      const clients =
      await pool.query(

        `
        SELECT *
        FROM clients

        ORDER BY id DESC
        `
      );

      return res.json({
        success:true,
        clients:clients.rows
      });

    }catch(error){

      return res.status(500).json({
        success:false,
        error:error.message
      });

    }

  }
);

/* ======================================
CLIENTS
====================================== */

app.get(
  "/admin/clients",

  authMiddleware,

  async(req,res)=>{

    try{

      const result =
      await pool.query(

        `
        SELECT *

        FROM clients

        ORDER BY id DESC
        `

      );

      return res.json(
        result.rows
      );

    }catch(error){

      return res.status(500).json({
        success:false,
        error:error.message
      });

    }

  }
);

/* ======================================
MESSAGES
====================================== */

app.get(
  "/admin/messages",

  authMiddleware,

  async(req,res)=>{

    try{

      const messages =
      await pool.query(

        `
        SELECT *

        FROM messages

        ORDER BY id DESC

        LIMIT 100
        `

      );

      return res.json({
        success:true,
        messages:
        messages.rows
      });

    }catch(error){

      return res.status(500).json({
        success:false,
        error:error.message
      });

    }

  }
);

/* ======================================
WEBHOOK WHATSAPP
====================================== */

app.post(
  "/webhook",

  async(req,res)=>{

    try{

      const data = req.body;

      const message =
      data?.data?.message?.conversation;

      const number =
      data?.data?.key?.remoteJid;

      if(!message){

        return res.sendStatus(200);

      }

      const clientResult =
      await pool.query(

        `
        SELECT * FROM clients
        WHERE number=$1
        `,

        [number]

      );

      let memory = "";

      if(clientResult.rows.length > 0){

        memory =
        clientResult.rows[0].memory || "";

      }

      memory += `\nCliente: ${message}`;

      await pool.query(

  `
  INSERT INTO messages
  (
    number,
    message,
    response
  )

  VALUES($1,$2,$3)
  `,

  [
    number,
    message,
    aiMessage
  ]

);

      await pool.query(

        `
        INSERT INTO clients
        (
          number,
          memory
        )

        VALUES($1,$2)

        ON CONFLICT(number)

        DO UPDATE SET

        memory=$2
        `,

        [
          number,
          memory
        ]

      );

      const productsResult =
      await pool.query(
        "SELECT * FROM products"
      );

      const productsText =

      productsResult.rows.map(product =>

        `
        Produto:
        ${product.name}

        Preço:
        ${product.price}

        Tipo:
        ${product.type}

        Descrição:
        ${product.description}
        `

      ).join("\n");

      const openaiResponse =
      await axios.post(

        "https://api.openai.com/v1/chat/completions",

        {

          model:"gpt-4o-mini",

          messages:[

            {

              role:"system",

              content:`

Você é uma atendente premium de vendas.

Você vende produtos no WhatsApp.

REGRAS:

- Seja humana
- Seja natural
- Nunca diga que é IA
- Use emojis modernos moderadamente
- Seja elegante
- Seja persuasiva
- Responda curto

PAGAMENTO:

- Produtos físicos:
podem usar pagamento na entrega.

- Produtos digitais:
precisam pagamento antecipado.

Analise automaticamente.

Produtos cadastrados:

${productsText}

Histórico cliente:

${memory}

`

            },

            {
              role:"user",
              content:message
            }

          ]

        },

        {

          headers:{

            Authorization:
            `Bearer ${process.env.OPENAI_API_KEY}`,

            "Content-Type":
            "application/json"

          }

        }

      );

      const aiMessage =

      openaiResponse
      .data
      .choices[0]
      .message
      .content;

      memory += `\nIA: ${aiMessage}`;

      await pool.query(

        `
        UPDATE clients

        SET memory=$1

        WHERE number=$2
        `,

        [
          memory,
          number
        ]

      );

      await axios.post(

        `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`,

        {
          number:number,
          text:aiMessage
        },

        {
          headers:{
            apikey:
            process.env.EVOLUTION_API_KEY
          }
        }

      );

      io.emit(
        "new-message",
        {
          number,
          message,
          response:aiMessage
        }
      );

      return res.sendStatus(200);

    }catch(error){

      console.log(error.message);

      return res.sendStatus(500);

    }

  }
);

/* ======================================
SERVER
====================================== */

const PORT =
process.env.PORT || 3000;

server.listen(PORT,()=>{

  console.log(
    `Servidor rodando na porta ${PORT} 🚀`
  );

});
