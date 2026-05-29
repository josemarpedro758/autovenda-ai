const express = require("express");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const { Pool } = require("pg");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
cors:{
origin:"*"
}
});

app.use(express.json());

app.use(
express.static(
path.join(__dirname)
)
);

const upload = multer({
dest:"uploads/"
});

const pool = new Pool({
connectionString:
process.env.DATABASE_URL,

ssl:{
rejectUnauthorized:false
}
});

cloudinary.config({
cloud_name:
process.env.CLOUDINARY_CLOUD_NAME,

api_key:
process.env.CLOUDINARY_API_KEY,

api_secret:
process.env.CLOUDINARY_API_SECRET
});

const SECRET_KEY =
"autovendaia_master";

const adminUser = {
email:"admin@autovendaia.com",
password:bcrypt.hashSync("123456",10)
};

async function createTables(){

await pool.query(`

CREATE TABLE IF NOT EXISTS products(

id SERIAL PRIMARY KEY,

name TEXT,
price TEXT,
description TEXT,
image TEXT,
type TEXT

)

`);

await pool.query(`

CREATE TABLE IF NOT EXISTS clients(

id SERIAL PRIMARY KEY,

number TEXT UNIQUE,
memory TEXT

)

`);

console.log("Banco conectado 🚀");

}

createTables();

function authMiddleware(req,res,next){

const authHeader =
req.headers.authorization;

if(!authHeader){

return res.status(401).json({
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

}catch{

return res.status(401).json({
error:"Token inválido"
});

}

}

app.get("/",(req,res)=>{

res.sendFile(
path.join(__dirname,"index.html")
);

});

app.get("/login",(req,res)=>{

res.sendFile(
path.join(__dirname,"login.html")
);

});

app.get("/dashboard",(req,res)=>{

res.sendFile(
path.join(__dirname,"dashboard.html")
);

});

res.sendFile(
path.join(__dirname,"index.html")
);

});

app.get("/dashboard",(req,res)=>{

res.sendFile(
path.join(__dirname,"dashboard.html")
);

});

app.get("/login",(req,res)=>{

res.sendFile(
path.join(__dirname,"login.html")
);

});

app.post("/login",async(req,res)=>{

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
error:"Credenciais inválidas"
});

}

const token = jwt.sign(
{ email },
SECRET_KEY,
{ expiresIn:"7d" }
);

return res.json({
success:true,
token
});

});

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

});

app.get(
"/admin/products",
authMiddleware,
async(req,res)=>{

const result =
await pool.query(
"SELECT * FROM products ORDER BY id DESC"
);

return res.json(
result.rows
);

});

app.post(
"/admin/products",
authMiddleware,
async(req,res)=>{

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
(name,price,description,image,type)

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

});

app.get(
"/admin/analytics",
authMiddleware,
async(req,res)=>{

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

products:
productsCount.rows[0].count,

clients:
clientsCount.rows[0].count,

messages:
Number(clientsCount.rows[0].count) * 9,

revenue:
Number(productsCount.rows[0].count) * 200,

recentProducts:
recentProducts.rows

});

});

app.post(
"/webhook",
async(req,res)=>{

try{

const data = req.body;

const message =
data.data.message?.conversation;

const number =
data.data.key.remoteJid;

if(!message){

return res.sendStatus(200);

}

const clientResult =
await pool.query(
"SELECT * FROM clients WHERE number=$1",
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
INSERT INTO clients(number,memory)

VALUES($1,$2)

ON CONFLICT(number)

DO UPDATE SET

memory=$2
`,

[number,memory]

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

Descrição:
${product.description}

Tipo:
${product.type}

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

Você é uma IA premium chamada AutoVenda IA.

Você é extremamente humana, elegante, persuasiva e profissional.

Você vende naturalmente no WhatsApp.

REGRAS:

- Nunca diga que é IA
- Converse como humana
- Seja simpática
- Recomende produtos
- Convença naturalmente
- Responda curto
- Use emojis modernos moderadamente

PAGAMENTO:

- Produtos físicos:
roupa,
tênis,
perfume,
relógio,
eletrônicos físicos

podem usar:
PAGAMENTO NA ENTREGA.

- Produtos digitais:
ebook,
curso,
software,
serviços digitais

precisam:
pagamento antecipado.

Analise o tipo do produto antes de responder.

Produtos:

${productsText}

Histórico:

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

[memory,number]

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

});

const PORT =
process.env.PORT || 3000;

server.listen(PORT,()=>{

console.log(
"AutoVenda IA Online 🚀"
);

});
