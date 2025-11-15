//Dependências
//npm init -y
//npm install express mysql2 dotenv cors

const cors = require('cors');

const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();


app.use(express.json());
app.use(cors())

const PORT = process.env.PORT || 3000;

// Rota GET - Listar usuários
app.get('/buscaUsuario', (req, res) => {
  db.query('SELECT * FROM usuario', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota GET - Planilha de treino
app.get('/buscaPlanilhaTreino', (req, res) => {
  const { id_usuario } = req.query;
  let sql = 'SELECT * FROM planilhaTreino';
  let params = [];
  if (id_usuario) {
    sql += ' WHERE id_usuario = ?';
    params.push(id_usuario);
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota GET - Buscar planilha por ID
app.get("/buscaPlanilhaPorId", (req, res) => {
    const id = req.query.id;

    db.query("SELECT * FROM planilhaTreino WHERE id_planilhaTreino = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro no servidor" });
        res.json(result[0]);
    });
});


// Rota GET - Listar Exercícios
app.get('/buscaExercicio', (req, res) => {
  db.query('SELECT * FROM exercicio', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota GET - Progressão de carga
app.get('/buscaProgressoCarga', (req, res) => {
  const { id_usuario } = req.query;
  let sql = 'SELECT * FROM progressoCarga';
  let params = [];
  if (id_usuario) {
    sql += ' WHERE id_usuario = ?';
    params.push(id_usuario);
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota GET - Peso corporal
app.get('/buscaPesoCorporal', (req, res) => {
  const { id_usuario } = req.query;
  let sql = 'SELECT * FROM pesoCorporal';
  let params = [];
  if (id_usuario) {
    sql += ' WHERE id_usuario = ?';
    params.push(id_usuario);
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota GET - Medida corporal
app.get('/buscaMedidaCorporal', (req, res) => {
  const { id_usuario } = req.query;
  let sql = 'SELECT * FROM medidaCorporal';
  let params = [];
  if (id_usuario) {
    sql += ' WHERE id_usuario = ?';
    params.push(id_usuario);
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota GET - Refeições
app.get('/buscaRefeicao', (req, res) => {
  const { id_usuario, dia_refeicao } = req.query;
  let sql = 'SELECT * FROM refeicao WHERE 1=1';
  let params = [];
  if (id_usuario) {
    sql += ' AND id_usuario = ?';
    params.push(id_usuario);
  }
  if (dia_refeicao) {
    sql += ' AND dia_refeicao = ?';
    params.push(dia_refeicao);
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota GET - Calorias diárias
app.get('/buscaCaloriasDiarias', (req, res) => {
  const { id_usuario } = req.query;
  let sql = 'SELECT * FROM caloriasDiarias';
  let params = [];
  if (id_usuario) {
    sql += ' WHERE id_usuario = ?';
    params.push(id_usuario);
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota GET - Listar Alimentos
app.get('/buscaAlimento', (req, res) => {
  db.query('SELECT * FROM alimento', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota GET - Passos
app.get('/buscaPassos', (req, res) => {
  const { id_usuario } = req.query;
  let sql = 'SELECT * FROM passos';
  let params = [];
  if (id_usuario) {
    sql += ' WHERE id_usuario = ?';
    params.push(id_usuario);
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota GET - Histórico do treino
app.get('/buscaHistoricoTreino', (req, res) => {
  const { id_usuario, id_exercicio } = req.query;

  let sql = 'SELECT * FROM historicoTreino WHERE 1=1';
  let params = [];

  if (id_usuario) {
    sql += ' AND id_usuario = ?';
    params.push(id_usuario);
  }

  if (id_exercicio) {
    sql += ' AND id_exercicio = ?';
    params.push(id_exercicio);
  }

  sql += ' ORDER BY dia_historicoTreino ASC, id_historicoTreino ASC';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Rota GET - Treino
app.get('/buscaTreino', (req, res) => {
  const { id_usuario, id_planilhaTreino } = req.query;

  let sql = `
    SELECT 
      t.id_treino,
      t.id_planilhaTreino,
      t.id_exercicio,
      e.nome_exercicio,
      t.series,
      t.repeticoes_treino,
      t.carga_treino
    FROM treino t
    JOIN exercicio e ON t.id_exercicio = e.id_exercicio
  `;

  let params = [];

  if (id_usuario) {
    sql += ' WHERE t.id_planilhaTreino IN (SELECT id_planilhaTreino FROM planilhaTreino WHERE id_usuario = ?)';
    params.push(id_usuario);
  } else if (id_planilhaTreino) {
    sql += ' WHERE t.id_planilhaTreino = ?';
    params.push(id_planilhaTreino);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ROTA GET - Buscar alimentos de uma refeição (com dados nutricionais)
app.get('/buscaRefeicaoAlimento', (req, res) => {
  const { id_refeicao } = req.query;

  if (!id_refeicao) {
    return res.status(400).json({ error: 'Informe o id_refeicao!' });
  }

  // Junta refeicaoAlimento com alimento para trazer os dados nutricionais
  const sql = `
    SELECT 
      ra.qtde_gramas,
      a.nome_alimento,
      a.calorias_alimento,
      a.proteinas_alimento,
      a.carboidratos_alimento,
      a.gorduras_alimento
    FROM refeicaoAlimento ra
    JOIN alimento a ON ra.id_alimento = a.id_alimento
    WHERE ra.id_refeicao = ?
  `;

  db.query(sql, [id_refeicao], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota que busca os alimentos do usuário logado para adicionar em uma refeição
app.get('/refeicoesDoUsuario/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT id_refeicao, nome_refeicao
    FROM refeicao
    WHERE id_usuario = ?
  `;

  db.query(sql, [id_usuario], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});


app.get('/alimentos', (req, res) => {
  const sql = `SELECT id_alimento, nome_alimento FROM alimento`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// Rota que busca os exercícios do usuário logado
app.get("/exerciciosDoUsuario/:id_usuario", (req, res) => {
  const { id_usuario } = req.params;

  const sqlPlanilha = `
    SELECT id_planilhaTreino 
    FROM planilhaTreino
    WHERE id_usuario = ? AND ativa_planilhaTreino = 1
  `;

  db.query(sqlPlanilha, [id_usuario], (err, planilhaRows) => {
    if (err) return res.status(500).json({ erro: err.message });

    if (planilhaRows.length === 0) {
      return res.status(404).json({ erro: "Planilha ativa não encontrada." });
    }

    const id_planilha = planilhaRows[0].id_planilhaTreino;

    const sqlExercicios = `
      SELECT id_exercicio, nome_exercicio 
      FROM exercicio
      WHERE id_planilhaTreino = ?
    `;

    db.query(sqlExercicios, [id_planilha], (err, exerciciosRows) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json(exerciciosRows);
    });
  });
});

// Rota POST - Fazer login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'email e senha são obrigatórios' });
  }

  const sql = 'SELECT * FROM usuario WHERE email = ? AND senha = ?';
  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Login bem-sucedido
    const user = results[0];
    res.json({
      message: 'Login bem-sucedido',
      user: {
        id: user.id_usuario,
        email: user.email,
        senha: user.senha,
        nome_usuario: user.nome_usuario
      }
    });
  });
});

//ROTA POST - Cadastro de novos usuarios
app.post('/cadastraUsuario', (req, res) => {
  const { nome_usuario, email, senha, data_nascimento, sexo, altura, peso_usuario } = req.body;

  if (!nome_usuario || !email || !senha || !data_nascimento || !sexo || !altura || !peso_usuario) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO usuario (nome_usuario, email, senha, data_nascimento, sexo, altura, peso_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [nome_usuario, email, senha, data_nascimento, sexo, altura, peso_usuario ], (err, result) => {
    if (err) { 
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Usuário já está cadastrado' });
      }
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Usuário registrado com sucesso', id: result.insertId });
  });
});

//ROTA POST - Cadastro de novos alimentos
app.post('/cadastraAlimento', (req, res) => {
  const { nome_alimento, calorias_alimento, proteinas_alimento, carboidratos_alimento, gorduras_alimento } = req.body;

  if (!nome_alimento || !calorias_alimento || !proteinas_alimento || !carboidratos_alimento || !gorduras_alimento) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO alimento (nome_alimento, calorias_alimento, proteinas_alimento, carboidratos_alimento, gorduras_alimento) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nome_alimento, calorias_alimento, proteinas_alimento, carboidratos_alimento, gorduras_alimento], (err, result) => {
    if (err) { 
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Alimento já cadastrado' });
      }
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Alimento registrado com sucesso', id: result.insertId });
  });
});

//ROTA POST - Cadastro de novos exercícios
app.post('/cadastraExercicio', (req, res) => {
  const { nome_exercicio, grupo_muscular, descricao_exercicio } = req.body;

  if (!nome_exercicio || !grupo_muscular || !descricao_exercicio) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO exercicio (nome_exercicio, grupo_muscular, descricao_exercicio) VALUES (?, ?, ?)';
  db.query(sql, [nome_exercicio, grupo_muscular, descricao_exercicio], (err, result) => {
    if (err) { 
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Exercício já cadastrado' });
      }
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Exercício registrado com sucesso', id: result.insertId });
  });
});

// ROTA POST - Cadastro de planilha de treino
app.post('/cadastraPlanilhaTreino', (req, res) => {
  const { id_usuario, nome_planilhaTreino, data_inicio, ativa_planilhaTreino } = req.body;

  if (!id_usuario || !nome_planilhaTreino || !data_inicio || !ativa_planilhaTreino) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO planilhaTreino (id_usuario, nome_planilhaTreino, data_inicio, ativa_planilhaTreino) VALUES (?, ?, ?, ?)';
  db.query(sql, [id_usuario, nome_planilhaTreino, data_inicio, ativa_planilhaTreino], (err, result) => {
    if (err) { 
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Planilha de treino já cadastrada' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Planilha de treino registrada com sucesso', id: result.insertId });
  });
});

// ROTA POST - Cadastro progressão de carga
app.post('/cadastraProgressoCarga', (req, res) => {
  const { id_usuario, id_exercicio, dia_progressoCarga, repeticoes_progressoCarga, carga_progressoCarga } = req.body;

  if (!id_usuario || !id_exercicio || !dia_progressoCarga || !repeticoes_progressoCarga || !carga_progressoCarga) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO progressoCarga (id_usuario, id_exercicio, dia_progressoCarga, repeticoes_progressoCarga, carga_progressoCarga) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [id_usuario, id_exercicio, dia_progressoCarga, repeticoes_progressoCarga, carga_progressoCarga], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Progressão de carga registrado com sucesso', id: result.insertId });
  });
});

// ROTA POST - Cadastro medida corporal
app.post('/cadastraMedidaCorporal', (req, res) => {
  const { id_usuario, dia_medidaCorporal, regiao_medidaCorporal, medida_cm } = req.body;

  if (!id_usuario || !dia_medidaCorporal || !regiao_medidaCorporal || !medida_cm) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO medidaCorporal (id_usuario, dia_medidaCorporal, regiao_medidaCorporal, medida_cm) VALUES (?, ?, ?, ?)';
  db.query(sql, [id_usuario, dia_medidaCorporal, regiao_medidaCorporal, medida_cm], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Medida corporal registrado com sucesso', id: result.insertId });
  });
});

// ROTA POST - Cadastro peso corporal
app.post('/cadastraPesoCorporal', (req, res) => {
  const { id_usuario, dia_pesoCorporal, peso_pesoCorporal, meta_peso } = req.body;

  if (!id_usuario || !dia_pesoCorporal || !peso_pesoCorporal || !meta_peso) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO pesoCorporal (id_usuario, dia_pesoCorporal, peso_pesoCorporal, meta_peso) VALUES (?, ?, ?, ?)';
  db.query(sql, [id_usuario, dia_pesoCorporal, peso_pesoCorporal, meta_peso], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Medida corporal registrado com sucesso', id: result.insertId });
  });
});

// ROTA POST - Cadastro de calorias diárias
app.post('/cadastraCaloriasDiarias', (req, res) => {
  const { id_usuario, data_caloriasDiarias, calorias_totais, proteinas_caloriasDiarias, carboidratos_caloriasDiarias, gorduras_caloriasDiarias } = req.body;

  if (!id_usuario || !data_caloriasDiarias || !calorias_totais || !proteinas_caloriasDiarias || !carboidratos_caloriasDiarias || !gorduras_caloriasDiarias) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO caloriasDiarias (id_usuario, data_caloriasDiarias, calorias_totais, proteinas_caloriasDiarias, carboidratos_caloriasDiarias, gorduras_caloriasDiarias) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [id_usuario, data_caloriasDiarias, calorias_totais, proteinas_caloriasDiarias, carboidratos_caloriasDiarias, gorduras_caloriasDiarias], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Calorias diárias registradas com sucesso', id: result.insertId });
  });
});

// ROTA POST - Cadastro de refeição
app.post('/cadastraRefeicao', (req, res) => {
  const { id_usuario, dia_refeicao, descricao_refeicao } = req.body;

  if (!id_usuario || !dia_refeicao || !descricao_refeicao) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO refeicao (id_usuario, dia_refeicao, descricao_refeicao) VALUES (?, ?, ?)';
  db.query(sql, [id_usuario, dia_refeicao, descricao_refeicao], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Refeição registrada com sucesso', id: result.insertId });
  });
});

// ROTA POST - Cadastro de alimento em refeição
app.post('/cadastraRefeicaoAlimento', (req, res) => {
  const { id_refeicao, id_alimento, qtde_gramas } = req.body;

  if (!id_refeicao || !id_alimento || !qtde_gramas) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO refeicaoAlimento (id_refeicao, id_alimento, qtde_gramas) VALUES (?, ?, ?)';
  db.query(sql, [id_refeicao, id_alimento, qtde_gramas], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Alimento adicionado à refeição com sucesso', id: result.insertId });
  });
});

// ROTA POST - Cadastro de passos
app.post('/cadastraPassos', (req, res) => {
  const { id_usuario, dia_passos, qtde_metros } = req.body;

  if (!id_usuario || !dia_passos || !qtde_metros) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO passos (id_usuario, dia_passos, qtde_metros) VALUES (?, ?, ?)';
  db.query(sql, [id_usuario, dia_passos, qtde_metros], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Passos registrados com sucesso', id: result.insertId });
  });
});

// ROTA POST - Cadastro de histórico de treino
app.post('/cadastraHistoricoTreino', (req, res) => {
  const { id_usuario, id_exercicio, dia_historicoTreino, series_feitas, repeticoes_feitas, carga_utilizada } = req.body;

  if (!id_usuario || !id_exercicio || !dia_historicoTreino || !series_feitas || !repeticoes_feitas || !carga_utilizada) {
    return res.status(400).json({ error: 'Preencha todos os dados solicitados!' });
  }

  const sql = 'INSERT INTO historicoTreino (id_usuario, id_exercicio, dia_historicoTreino, series_feitas, repeticoes_feitas, carga_utilizada) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [id_usuario, id_exercicio, dia_historicoTreino, series_feitas, repeticoes_feitas, carga_utilizada], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Histórico de treino registrado com sucesso', id: result.insertId });
  });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});