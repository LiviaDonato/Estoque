const express = require('express')
const router = express.Router()
const BD = require('../db')
const { log10 } = require('chart.js/helpers')

// Rota principal do Painel Administrativo
router.get('/', async (req, res) => {
    //    views/admin/dashboard.ejs
    const qProdutos = await BD.query('select count(*) as total_produtos from produtos')
    const qCategorias = await BD.query('select count(*) as total_categorias from categorias')
    const tEstoque = await BD.query('select SUM((estoque * valor)) as valor_total from produtos')
    const estoqueC = await BD.query(`select c.nome_categoria, (p.estoque * p.valor) as estoque_categoria from categorias as c left join produtos as p on c.id_categoria = p.id_categoria`)
    const estoqueP = await BD.query(`select nome_produto, estoque from produtos`)
    const estoqueMais = await BD.query(`select count(*) as total_mais from produtos where estoque > estoque_minimo`);
    const estoqueMin = await BD.query(`select count(*) as total_minimo from produtos where estoque = estoque_minimo`);
    const estoqueMen = await BD.query(`select count(*) as total_menos from produtos where estoque < estoque_minimo`);
    const estoqueMinMenos = await BD.query(`select count(*) as total_minimo from produtos where estoque <= estoque_minimo`)
    res.render('admin/dashboard', {
        totalProdutos: qProdutos.rows[0].total_produtos, 
        totalCategorias: qCategorias.rows[0].total_categorias,
        totalEstoque: tEstoque.rows[0].valor_total, 
        estoqueCategoria: estoqueC.rows,
        estoqueProduto: estoqueP.rows, 
        estoqueMais: estoqueMais.rows[0].total_mais,
        estoqueMinimo: estoqueMin.rows[0].total_minimo,
        estoqueMenos: estoqueMen.rows[0].total_menos,
        estoqueMinMenos: estoqueMinMenos.rows[0].total_minimo
    });
        
})
module.exports = router