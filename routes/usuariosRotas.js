const express = require('express')
const router = express.Router()
const BD = require('../db')

// Listar usuarios (R - Read)
// Para acessar essa rota digito /usuarios/
router.get('/', async (req, res) => {
    try {
        const { busca = '' } = req.query
        // const busca = req.query.busca || ''
        const { ordenar = 'nome' } = req.query

        const pg = req.query.pg || 1 // Obtendo a página de dados
        const limite = 10 // Número de registro por página
        const offset = (pg - 1) * limite // Quantidade de registros que quero "pular"
        const buscaDados = await BD.query(`SELECT * FROM usuarios as u
            where lower(u.nome) like $1 or lower(u.usuario) like $1 or lower(u.senha) like $1
            order by ${ordenar}
            limit $2 offset $3`, [`%${busca.toLowerCase()}%`, limite, offset])
        const totalItens = await BD.query(`select count(*) as total FROM usuarios as u
            where lower(u.nome) like $1 or lower(u.usuario) like $1 or lower(u.senha) like $1
            `, [`%${busca.toLowerCase()}%`])
        const totalPgs = Math.ceil(totalItens.rows[0].total / limite)
        res.render('usuariosTelas/lista', { usuarios: buscaDados.rows, busca: busca, ordenar: ordenar, pgAtual: parseInt(pg), totalPgs: totalPgs })
    } catch (erro) {
        console.log('Erro ao listar usuarios', erro)
        res.render('usuariosTelas/lista', { mensagem: erro })
    }
})

router.get('/conta', (req, res) => {
    res.render('admin/conta')
})
router.get('/:id/dados', async (req, res) => {
    const { conta, id } = req.params
    // const id = req.params.id
    const resultado = await BD.query('select * from usuarios where id_usuario = $1', [id])
    res.render('usuariosTelas/dados', {usuario: resultado.rows[0]})
})
router.post('/:id/dados', async (req, res) => {
    const { id } = req.params
    const { nome, usuario, senha, foto } = req.body
    // const id = req.params.id
    await BD.query('UPDATE usuarios SET nome = $2, usuario = $3, senha = $4, foto = $5 where id_usuario = $1', [id, nome, usuario, senha, foto])
    res.redirect('/usuarios')
})

// Rota para abrir tela para criar um novo usuarios (C - Create) 
// Para acessar /usuarios/novo
router.get('/novo', (req, res) => {
    res.render('usuariosTelas/criar')
})
router.post('/novo', async (req, res) => {
    const { nome, usuario, senha } = req.body
    //                =
    // const nome = req.body.nome_professor
    // const usuario = req.body.telefone
    // const senha = req.body.formacao
    await BD.query(`insert into usuarios (nome, usuario, senha)
        values ($1, $2, $3)`, [nome, usuario, senha])
    res.redirect('/usuarios')
})
// Excluindo um usuarios (D - Delete)
// Para acessar /usuarios/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    await BD.query('delete from usuarios where id_usuario = $1', [id])
    res.redirect('/usuarios')
})
// Editar um usuarios (U - Update)
// Para acessar /usuarios/1/editar
router.get('/:id/editar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    const resultado = await BD.query('select * from usuarios where id_usuario = $1', [id])
    res.render('usuariosTelas/editar', {usuario: resultado.rows[0]})
})
router.post('/:id/editar', async (req, res) => {
    const { id } = req.params
    const { nome, usuario, foto } = req.body
    await BD.query(`update usuarios set nome = $2, usuario = $3, foto = $4
        where id_usuario = $1`, [id, nome, usuario, foto])
    res.redirect('/usuarios')
})

module.exports = router