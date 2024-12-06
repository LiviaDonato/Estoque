require('dotenv').config();
const express = require('express')
const path = require('path');
const session = require('express-session')
const app = express()

//Configurações
app.set('views', path.join(__dirname, 'views')); // Configura o diretório das views
app.set('view engine', 'ejs') //Configura o motor de templates para EJS
app.use(express.static(path.join(__dirname, 'public'))); //Define pasta para arquivos css / img
app.use(express.urlencoded({ extended: true })) //Para processar os dados do formulário
app.use(express.json()); // utilizar dados em formato JSON
app.use(session({
    secret: 'sesisenai', // Um segredo para assinar a sessão
    resave: false,
    saveUninitialized: true // Se não houver dados na sessão, não salva
}))

// Middleware para verificar se o usuário está logado
const verificarAutenticacao = (req, res, next) => {
    if (req.session.usuarioLogado) {
        // Disponibilizando o nomeUsuario da sessão para a tela .ejs
        res.locals.nomeUsuario = req.session.nomeUsuario
        res.locals.idUsuario = req.session.idUsuario
        res.locals.fotoUsuario = req.session.fotoUsuario
        next()
    } else {
        res.redirect('/auth/login')
    }
}

//Rota da página principal "Landing Page"
app.get('/', (req, res) => {
res.render('landing/index')
} )

// Utilizando Rotas Admin
const adminRotas = require('./routes/admin')
app.use('/admin', verificarAutenticacao, adminRotas)

// Utilizando Rotas de Categorias
const categoriasRotas = require('./routes/categoriasRotas')
app.use('/categorias', verificarAutenticacao, categoriasRotas)

// Utilizando Rotas de Usuarios
const usuariosRotas = require('./routes/usuariosRotas')
app.use('/usuarios', verificarAutenticacao, usuariosRotas)

// Utilizando Rotas de Movimentacoes
const movimentacoesRotas = require('./routes/movimentacoesRotas')
app.use('/movimentacoes', verificarAutenticacao, movimentacoesRotas)

// Utilizando Rotas de Produtos
const produtosRotas = require('./routes/produtosRotas')
app.use('/produtos', verificarAutenticacao, produtosRotas)

// Utilizando Rotas de Login
const loginRotas = require('./routes/loginRotas')
app.use('/auth', loginRotas)

const porta = 3001
app.listen(porta, () => {
console.log(`Servidor rodando na porta http://localhost:${porta}`)
})