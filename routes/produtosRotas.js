const express = require('express')
const router = express.Router()
const BD = require('../db')

// Listar produtos (R - Read)
// Rota localhost:3001/produtos/
router.get('/', async (req, res) => {
    try {
        const { busca = '' } = req.query
        // const busca = req.query.busca || ''
        let buscaqtd = 0
        const { ordenar = 'nome_produto' } = req.query

        if (typeof(busca) == Number){
            buscaqtd = busca
        } else {
            buscaqtd = 0
        }

        const pg = req.query.pg || 1 // Obtendo a página de dados
        const limite = 10 // Número de registros por página
        const offset = (pg - 1) * limite // Quantidade de registros que quero "pular"
        const buscaDados = await BD.query(`
            select p.id_produto, p.nome_produto, p.estoque, p.estoque_minimo, p.valor, c.nome_categoria, p.imagem
            from produtos as p 
            left join categorias as c on p.id_categoria = c.id_categoria 
            where lower(p.nome_produto) like $1 or p.estoque = $2 or p.estoque_minimo = $2 or p.valor = $2
            order by ${ordenar}
            limit $3 offset $4`, [`%${busca.toLowerCase()}%`, buscaqtd, limite, offset])
        const totalItens = await BD.query(`
            select count(*) as total 
            from produtos as p 
            left join categorias as c on p.id_categoria = c.id_categoria 
            where lower(p.nome_produto) like $1 or p.estoque = $2 or p.estoque_minimo = $2 or p.valor = $2
            `, [`%${busca.toLowerCase()}%`, buscaqtd])
        const totalPgs = Math.ceil(totalItens.rows[0].total / limite)
        res.render('produtosTelas/lista', { vetorDados: buscaDados.rows, busca: busca, ordenar: ordenar, pgAtual: parseInt(pg), totalPgs: totalPgs })
    } catch (erro) {
        console.log('Erro ao listar produtos', erro)
        res.render('produtosTelas/lista', { mensagem: erro })
    }
})
// Rota para abrir tela para criar uma novo produto (C - Create)
// Para acessar localhost:3000/disciplinas/novo
router.get('/novo', async (req, res) => {
    try {
        const resultado = await BD.query('select * from categorias order by nome_categoria')
        res.render('produtosTelas/criar', { categoriasCadastradas: resultado.rows })
    } catch (erro) {
        console.log('Erro ao abrir tela de cadastro de produtos', erro)
        res.render('produtosTelas/lista', { mensagem: erro })
    }
})
router.post('/novo', async (req, res) => {
    try {
        const { nome_produto, estoque, estoque_minimo, valor, imagem, id_categoria } = req.body
        // const nome_produto = req.body.nome_produto
        // const id_categoria = req.body.id_categoria
        await BD.query('insert into produtos (nome_produto, estoque, estoque_minimo, valor, imagem, id_categoria) values ($1, $2, $3, $4, $5, $6)',
            [nome_produto, estoque, estoque_minimo, valor, imagem, id_categoria])
        // Redirecionando para a tela de consulta de produto
        res.redirect('/produtos/')
    } catch (erro) {
        console.log('Erro ao cadastrar produto', erro)
        res.render('produtosTelas/lista', { mensagem: erro })
    }
})
// Excluindo uma produto (D - Delete)
// Para acessar /produtos/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    await BD.query('delete from produtos where id_produto = $1', [id])
    res.redirect('/produtos')
})

router.get('/:id/editar', async(req, res) => {
    try {
        const { id } = req.params
        const resultado = await BD.query('select * from produtos where id_produto = $1', [id])
        // Lista com todas as categorias para o select
        const catCadastradas = await BD.query('select * from categorias order by nome_categoria')
        const { busca = '' } = req.query
        const buscaqtd = req.query.busca || 0
        // const busca = req.query.busca || ''
        const { ordenar = 'tipo_movimentacao' } = req.query
        const buscaDados = await BD.query(`select m.id_movimentacao, m.tipo_movimentacao, TO_CHAR(m.data_movimentacao, 'dd/mm/yyyy') as data, m.quantidade, m.descricao, p.nome_produto,
            p.estoque, p.estoque_minimo, p.id_categoria, u.nome, p.imagem
            from movimentacoes as m inner join produtos as p
            on m.id_produto = p.id_produto
            inner join usuarios as u
            on m.id_usuario = u.id_usuario
            where (lower(m.tipo_movimentacao) like $1 or TO_CHAR(m.data_movimentacao, 'dd/mm/yyyy') like $1 or m.quantidade = $2
            or lower(m.descricao) like $1 or lower(p.nome_produto) like $1) and p.id_produto = $3
            order by ${ordenar}`, [`%${busca.toLowerCase()}%`, buscaqtd, id])
            // Usando Day.js para formatar a data
            // const data = buscaDados.rows[0].data_movimentacao;  // Exemplo: '2024-11-07T14:30:00'
            // const dataFormatada = dayjs(data).format('DD/MM/YYYY');
            // console.log(dataFormatada);
        const estoque = await BD.query(`select m.descricao, m.estoque from movimentacoes as m inner join produtos as p
            on m.id_produto = p.id_produto where p.id_produto = $1`, [id])
            
            
        res.render('produtosTelas/editar', { vetorDados: buscaDados.rows, busca: busca, ordenar: ordenar, produto: resultado.rows[0], categoriasCadastradas: catCadastradas.rows, estoqueM: estoque.rows})
    } catch (erro) {
        console.log('Erro ao editar produto', erro)
    }
})
router.post('/:id/editar', async (req, res) => {
    try {
        const { id } = req.params
        const { nome_produto, id_categoria, estoque, estoque_minimo, valor, imagem } = req.body
        await BD.query(`update produtos set nome_produto = $1, id_categoria = $2, estoque = $3, estoque_minimo = $4, valor = $5, imagem = $6
            where id_produto = $7`, [nome_produto, id_categoria, estoque, estoque_minimo, valor, imagem, id])
        res.redirect('/produtos/')
    } catch (erro) {
        console.log('Erro ao gravar produto', erro)
    }
})
// Criando rota para lançar uma nota
router.post('/:id/lancar-movimentacoes', async (req, res) => {
    try {
        const { id } = req.params
        const { tipo_movimentacao, quantidade, descricao} = req.body
        const id_usuario = req.session.idUsuario
        await BD.query(`insert into movimentacoes (tipo_movimentacao, data_movimentacao, quantidade, descricao, id_produto, id_usuario)
            values ($1,current_date, $2, $3, $4, $5)`, [tipo_movimentacao, quantidade, descricao, id, id_usuario])
        res.redirect(`/produtos/${id}/editar`)
    } catch (erro) {
        console.log('Erro ao gravar aluno', erro)
    }
})

module.exports = router