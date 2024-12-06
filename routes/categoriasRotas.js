const express = require('express')
const router = express.Router()
const BD = require('../db')

// Listar categoria (R - Read)
// Para acessar essa rota digito /categoria/
router.get('/', async (req, res) => {
    try {
        const { busca = '' } = req.query
        // const busca = req.query.busca || ''
        const { ordenar = 'nome_categoria asc' } = req.query

        const pg = req.query.pg || 1 // Obtendo a página de dados
        const limite = 10 // Número de registros por página
        const offset = (pg - 1) * limite // Quantidade de registros que quero "pular"
        const buscaDados = await BD.query(`SELECT * FROM categorias as c
            where lower(c.nome_categoria) like $1
            order by ${ordenar}
            limit $2 offset $3`, [`%${busca.toLowerCase()}%`, limite, offset])
        const totalItens = await BD.query(`SELECT count(*) as total FROM categorias as c
            where lower(c.nome_categoria) like $1`, [`%${busca.toLowerCase()}%`])
        const totalPgs = Math.ceil(totalItens.rows[0].total / limite)
        res.render('categoriasTelas/lista', { categorias: buscaDados.rows, busca: busca, ordenar: ordenar, pgAtual: parseInt(pg), totalPgs: totalPgs })
    } catch (erro) {
        console.log('Erro ao listar categorias', erro)
        res.render('categoriasTelas/lista', { mensagem: erro })
    }
})
// Rota para abrir tela para criar uma nova categoria (C - Create)
// Para acessar /categoria/novo
router.get('/novo', (req, res) => {
    res.render('categoriasTelas/criar')
})

router.post('/novo', async (req, res) => {
    const { nome_categoria } = req.body
    // const nome_categoria = req.body.nome_categoria
    await BD.query(`insert into categorias (nome_categoria)
        values ($1)`, [nome_categoria])
    res.redirect('/categorias')
})
// Excluindo uma categoria (D - Delete)
// Para acessar /categoria/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    await BD.query('delete from categorias where id_categoria = $1', [id])
    res.redirect('/categorias')
})
// Editar uma categoria (U - Update)
// Para acessar /categoria/1/editar
router.get('/:id/editar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    const resultado = await BD.query('select * from categorias where id_categoria = $1', [id])
    res.render('categoriasTelas/editar', {categoria: resultado.rows[0]})
})
router.post('/:id/editar', async (req, res) => {
    const { id } = req.params
    const { nome_categoria } = req.body
    await BD.query(`update categorias set nome_categoria = $1
        where id_categoria = $2`, [nome_categoria, id])
    res.redirect('/categorias')
})

module.exports = router