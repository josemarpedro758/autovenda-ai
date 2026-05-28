const express = require("express");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

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

let products = [

  {
    id:1,
    name:"Tênis Nike Air",
    price:"45.000 Kz",
    description:
      "Tênis premium confortável.",

    image:
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  }

];

const clients = [];

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

app.get(
  "/admin/products",
  authMiddleware,
  (req,res)=>{

    res.json(products);

  }
);

app.post(
  "/admin/products",
  authMiddleware,
  async(req,res)=>{

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

  }
);

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

  }
);

app.get(
  "/admin/clients",
  authMiddleware,
  (req,res)=>{

    res.json(clients);

  }
);

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, ()=>{

  console.log(

    `AutoVenda IA Online na porta ${PORT}`

  );

});
