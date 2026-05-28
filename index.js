<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>AutoVenda IA • A Nova Geração de Compras Online</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:'Inter',sans-serif;
}

body{

background:
linear-gradient(
135deg,
#050816,
#0b1023,
#121d3a
);

overflow-x:hidden;
color:white;

}

body::before{

content:"";

position:fixed;

width:700px;
height:700px;

background:
radial-gradient(
circle,
rgba(124,58,237,0.35),
transparent 70%
);

top:-200px;
right:-200px;

z-index:-1;

}

body::after{

content:"";

position:fixed;

width:700px;
height:700px;

background:
radial-gradient(
circle,
rgba(0,255,191,0.18),
transparent 70%
);

bottom:-300px;
left:-300px;

z-index:-1;

}

header{

display:flex;
justify-content:space-between;
align-items:center;

padding:28px 8%;

position:sticky;
top:0;

backdrop-filter:blur(18px);

background:rgba(255,255,255,0.03);

border-bottom:
1px solid rgba(255,255,255,0.05);

z-index:999;

}

.logo{

font-size:30px;
font-weight:900;

background:
linear-gradient(
90deg,
#6ee7ff,
#7c3aed,
#00ffbf
);

-webkit-background-clip:text;
-webkit-text-fill-color:transparent;

}

nav{

display:flex;
align-items:center;
gap:22px;

}

nav a{

text-decoration:none;
color:#cbd5e1;

font-weight:500;

transition:0.3s;

}

nav a:hover{

color:white;

}

.btn{

padding:14px 22px;

border-radius:16px;

border:none;

cursor:pointer;

font-weight:700;

font-size:14px;

transition:0.3s;

}

.btn-login{

background:rgba(255,255,255,0.08);

color:white;

}

.btn-dashboard{

background:
linear-gradient(
90deg,
#7c3aed,
#06b6d4
);

color:white;

box-shadow:
0 10px 30px rgba(124,58,237,0.35);

}

.btn:hover{

transform:translateY(-3px);

}

.hero{

min-height:100vh;

display:flex;
align-items:center;
justify-content:space-between;

padding:0 8%;

gap:60px;

}

.hero-text{

max-width:650px;

}

.badge{

display:inline-block;

padding:10px 18px;

background:rgba(255,255,255,0.08);

border:
1px solid rgba(255,255,255,0.08);

border-radius:999px;

margin-bottom:28px;

font-size:14px;

backdrop-filter:blur(12px);

}

.hero h1{

font-size:72px;
line-height:1.05;

font-weight:900;

margin-bottom:24px;

}

.gradient{

background:
linear-gradient(
90deg,
#6ee7ff,
#7c3aed,
#00ffbf
);

-webkit-background-clip:text;
-webkit-text-fill-color:transparent;

}

.hero p{

font-size:20px;

line-height:1.7;

color:#94a3b8;

margin-bottom:35px;

}

.hero-buttons{

display:flex;
gap:18px;

flex-wrap:wrap;

}

.hero-image{

flex:1;
display:flex;
justify-content:center;

}

.hero-card{

width:520px;

background:rgba(255,255,255,0.06);

border:
1px solid rgba(255,255,255,0.08);

backdrop-filter:blur(22px);

border-radius:36px;

padding:30px;

box-shadow:
0 20px 80px rgba(0,0,0,0.35);

animation:float 5s ease-in-out infinite;

}

.hero-card img{

width:100%;
border-radius:24px;

}

.stats{

display:grid;

grid-template-columns:
repeat(auto-fit,minmax(220px,1fr));

gap:24px;

padding:80px 8%;

}

.stat{

background:rgba(255,255,255,0.05);

padding:32px;

border-radius:30px;

backdrop-filter:blur(20px);

border:
1px solid rgba(255,255,255,0.06);

transition:0.3s;

}

.stat:hover{

transform:translateY(-6px);

}

.stat h2{

font-size:42px;

margin-bottom:12px;

}

.features{

padding:100px 8%;

}

.section-title{

text-align:center;

margin-bottom:70px;

}

.section-title h2{

font-size:54px;
margin-bottom:18px;

}

.section-title p{

color:#94a3b8;
font-size:18px;

}

.feature-grid{

display:grid;

grid-template-columns:
repeat(auto-fit,minmax(320px,1fr));

gap:28px;

}

.feature{

background:rgba(255,255,255,0.05);

padding:34px;

border-radius:30px;

backdrop-filter:blur(18px);

border:
1px solid rgba(255,255,255,0.06);

transition:0.3s;

}

.feature:hover{

transform:translateY(-6px);

}

.feature h3{

font-size:24px;

margin:18px 0;

}

.feature p{

color:#94a3b8;
line-height:1.7;

}

.cta{

padding:120px 8%;

text-align:center;

}

.cta-box{

background:
linear-gradient(
135deg,
rgba(124,58,237,0.18),
rgba(6,182,212,0.18)
);

border:
1px solid rgba(255,255,255,0.08);

backdrop-filter:blur(22px);

padding:70px;

border-radius:40px;

}

.cta h2{

font-size:56px;

margin-bottom:24px;

}

.cta p{

font-size:20px;

color:#cbd5e1;

margin-bottom:34px;

}

footer{

padding:40px 8%;

display:flex;
justify-content:space-between;
align-items:center;

border-top:
1px solid rgba(255,255,255,0.05);

color:#94a3b8;

}

@keyframes float{

0%{
transform:translateY(0px);
}

50%{
transform:translateY(-14px);
}

100%{
transform:translateY(0px);
}

}

@media(max-width:1100px){

.hero{

flex-direction:column;
padding-top:120px;

}

.hero h1{

font-size:52px;

}

.hero-card{

width:100%;

}

header{

padding:24px;

}

nav{

display:none;

}

}

</style>
</head>

<body>

<header>

<div class="logo">
🚀 AutoVenda IA
</div>

<nav>

<a href="#">Início</a>
<a href="#">IA</a>
<a href="#">Analytics</a>
<a href="#">WhatsApp</a>
<a href="#">Automação</a>

<button class="btn btn-login"
onclick="window.location.href='/login.html'">
Entrar
</button>

<button class="btn btn-dashboard"
onclick="window.location.href='/dashboard.html'">
Dashboard
</button>

</nav>

</header>

<section class="hero">

<div class="hero-text">

<div class="badge">
🌍 Plataforma Global de Automação Inteligente
</div>

<h1>

A nova geração de
<span class="gradient">
compras online
</span>
no mundo.

</h1>

<p>

Venda automaticamente no WhatsApp usando Inteligência Artificial.
Automatize atendimento, recomendações, conversas, memória de clientes e vendas globais com tecnologia SaaS 2026.

</p>

<div class="hero-buttons">

<button class="btn btn-dashboard"
onclick="window.location.href='/dashboard.html'">
🚀 Começar Agora
</button>

<button class="btn btn-login"
onclick="window.location.href='/login.html'">
🔐 Fazer Login
</button>

</div>

</div>

<div class="hero-image">

<div class="hero-card">

<img src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1200&auto=format&fit=crop">

</div>

</div>

</section>

<section class="stats">

<div class="stat">

<h2>24/7</h2>

<p>
🤖 IA vendendo automaticamente
</p>

</div>

<div class="stat">

<h2>+500%</h2>

<p>
📈 aumento de produtividade
</p>

</div>

<div class="stat">

<h2>Global</h2>

<p>
🌎 vendas em qualquer país
</p>

</div>

<div class="stat">

<h2>2026</h2>

<p>
⚡ tecnologia SaaS premium
</p>

</div>

</section>

<section class="features">

<div class="section-title">

<h2>
🔥 Recursos Premium
</h2>

<p>
Tecnologia moderna para negócios globais inteligentes
</p>

</div>

<div class="feature-grid">

<div class="feature">

<h3>
🤖 Inteligência Artificial
</h3>

<p>

A IA conversa naturalmente, recomenda produtos, lembra clientes e fecha vendas automaticamente.

</p>

</div>

<div class="feature">

<h3>
💬 WhatsApp Automático
</h3>

<p>

Respostas automáticas profissionais integradas ao WhatsApp em tempo real.

</p>

</div>

<div class="feature">

<h3>
📈 Analytics Inteligente
</h3>

<p>

Dashboard premium com gráficos, estatísticas, clientes e crescimento empresarial.

</p>

</div>

<div class="feature">

<h3>
🌍 Escalável Globalmente
</h3>

<p>

Venda em qualquer país do mundo usando estrutura SaaS moderna e escalável.

</p>

</div>

<div class="feature">

<h3>
☁️ Cloud Storage
</h3>

<p>

Upload inteligente de imagens usando Cloudinary profissional integrado.

</p>

</div>

<div class="feature">

<h3>
🔒 Segurança Premium
</h3>

<p>

Login seguro, autenticação JWT e backend empresarial moderno.

</p>

</div>

</div>

</section>

<section class="cta">

<div class="cta-box">

<h2>
🚀 Transforme seu negócio com IA
</h2>

<p>

Automatize vendas, clientes e atendimento usando tecnologia moderna de Inteligência Artificial.

</p>

<button class="btn btn-dashboard"
onclick="window.location.href='/dashboard.html'">

🌍 Entrar na Plataforma

</button>

</div>

</section>

<footer>

<div>
© 2026 AutoVenda IA
</div>

<div>
SaaS Global Premium
</div>

</footer>

</body>
</html>
