const express = require("express");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");

const app = express();

const upload = multer({
  dest:"uploads/"
});

app.use(express.json());

app.use(
  express.static(
    path.join(__dirname)
  )
);

cloudinary.config({

  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET

});

const SECRET_KEY =
  "autovendaia_secret";

const adminUser = {

  email:
    "admin@autovendaia.com",

  password:
    bcrypt.hashSync(
      "123456",
      10
    )

};

let products = [];

function authMiddleware(
  req,
  res,
  next
){

  const authHeader =
    req.headers.authorization;

  if(!authHeader){

    return res.status(401).json({
      error:
        "Token não enviado"
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
      error:
        "Token inválido"
    });

  }

}

app.get("/", (req,res)=>{

  res.send(
    "AutoVenda IA Online 🚀"
  );

});

app.post("/login", async(req,res)=>{

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
      error:
        "Credenciais inválidas"
    });

  }

  const token = jwt.sign(

    { email },

    SECRET_KEY,

    {
      expiresIn:"7d"
    }

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
(req,res)=>{

res.json(products);

});

app.post(
"/admin/products",
authMiddleware,
(req,res)=>{

const {
name,
price,
description,
image
} = req.body;

const newProduct = {

id:Date.now(),

name,
price,
description,
image

};

products.push(
newProduct
);

return res.json({

success:true,
product:newProduct

});

});

app.delete(
"/admin/products/:id",
authMiddleware,
(req,res)=>{

const id =
Number(req.params.id);

products =
products.filter(
product =>
product.id !== id
);

return res.json({
success:true
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

const openaiResponse =
await axios.post(

"https://api.openai.com/v1/chat/completions",

{

model:"gpt-4o-mini",

messages:[

{
role:"system",
content:

`
Você é uma IA profissional de vendas.

Seu nome é AutoVenda IA.

Você vende produtos pelo WhatsApp.

Seja educada,
moderna,
persuasiva
e humana.

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

await axios.post(

`${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`,

{

number:
number,

text:
aiMessage

},

{

headers:{

apikey:
process.env.EVOLUTION_API_KEY

}

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

app.listen(PORT, ()=>{

console.log(
`AutoVenda IA Online na porta ${PORT}`
);

});
