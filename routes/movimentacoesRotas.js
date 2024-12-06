const express = require('express')
const router = express.Router()
const BD = require('../db')
// const dayjs = require('dayjs');

// Listar movimentações (R - Read)
// Rota localhost:3001/movimentacoes/
router.get('/', async (req, res) => {
    try {
        const { busca = '' } = req.query
        let buscaqtd = 0
        // const busca = req.query.busca || ''
        const { ordenar = 'tipo_movimentacao' } = req.query
        const id_user  = req.session.idUsuario
        if (typeof(busca) == Number){
          buscaqtd = busca
      } else {
          buscaqtd = 0
      }
        const buscaDados = await BD.query(`
            SELECT 
              m.id_movimentacao, 
              m.tipo_movimentacao, 
              TO_CHAR(m.data_movimentacao, 'dd/mm/yyyy') AS data, 
              m.quantidade, 
              m.descricao, 
              p.nome_produto, 
              m.id_usuario,
              m.estoque
            FROM movimentacoes AS m
            INNER JOIN produtos AS p 
              ON m.id_produto = p.id_produto
            INNER JOIN usuarios AS u
              ON m.id_usuario = u.id_usuario
            WHERE 
              (LOWER(m.tipo_movimentacao) LIKE $1 
              OR TO_CHAR(m.data_movimentacao, 'dd/mm/yyyy') LIKE $1 
              OR m.quantidade = $2 
              OR LOWER(m.descricao) LIKE $1 
              OR LOWER(p.nome_produto) LIKE $1)
              AND u.id_usuario = $3  
            ORDER BY ${ordenar}`, 
            [`%${busca.toLowerCase()}%`, buscaqtd, id_user]);
          
            // Usando Day.js para formatar a data
            // const data = buscaDados.rows[0].data_movimentacao;  // Exemplo: '2024-11-07T14:30:00'
            // const dataFormatada = dayjs(data).format('DD/MM/YYYY');
            // console.log(dataFormatada);
        
           
        res.render('movimentacoesTelas/lista', { vetorDados: buscaDados.rows, busca: busca, ordenar: ordenar})
    } catch (erro) {
        console.log('Erro ao listar movimentacoes', erro)
        res.render('movimentacoesTelas/lista', { mensagem: erro })
    }
})

module.exports = router