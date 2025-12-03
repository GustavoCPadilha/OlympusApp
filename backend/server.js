//Dependências
//npm init -y
//npm install express mysql2 dotenv cors

const cors = require('cors');

const express = require('express');
const app = express();
const db = require('./db');


app.use(express.json());
app.use(cors())

const PORT = 3000;

// Startup identification log to help debugging which file/version is running
console.log(`Starting backend server from file: ${__filename}`);


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
app.get('/exerciciosDoUsuario/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  // Busca a planilha ativa do usuário
  const sqlPlanilha = `
    SELECT id_planilhaTreino
    FROM planilhaTreino
    WHERE id_usuario = ? AND ativa_planilhaTreino = 1
  `;

  db.query(sqlPlanilha, [id_usuario], (err, planilhaRows) => {
    if (err) return res.status(500).json({ erro: err.message });

    if (planilhaRows.length === 0) {
      return res.status(404).json({ erro: 'Planilha ativa não encontrada.' });
    }

    const id_planilha = planilhaRows[0].id_planilhaTreino;

    // A tabela `exercicio` não possui id_planilhaTreino na estrutura SQL,
    // então para recuperar os exercícios vinculados à planilha devemos
    // consultar a tabela `treino` e juntar com `exercicio`.
    const sqlExercicios = `
      SELECT DISTINCT e.id_exercicio, e.nome_exercicio
      FROM treino t
      JOIN exercicio e ON t.id_exercicio = e.id_exercicio
      WHERE t.id_planilhaTreino = ?
    `;

    db.query(sqlExercicios, [id_planilha], (err, exerciciosRows) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json(exerciciosRows);
    });
  });
});

// Rota GET - Buscar treinos (alias usado pelo frontend)
app.get('/buscaTreinosDaPlanilha', (req, res) => {
  const { id_planilha } = req.query;
  if (!id_planilha) return res.status(400).json({ error: 'Informe id_planilha' });

  const sql = `
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
    WHERE t.id_planilhaTreino = ?
  `;

  db.query(sql, [id_planilha], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Rota POST - Cadastrar histórico de treino (usada pelo frontend ao marcar séries)
app.post('/cadastraHistoricoTreino', (req, res) => {
  const { id_usuario, id_exercicio, dia_historicoTreino, series_feitas, repeticoes_feitas, carga_utilizada } = req.body;

  if (!id_usuario || !id_exercicio || !dia_historicoTreino || !series_feitas || !repeticoes_feitas) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const sql = `INSERT INTO historicoTreino (id_usuario, id_exercicio, dia_historicoTreino, series_feitas, repeticoes_feitas, carga_utilizada) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [id_usuario, id_exercicio, dia_historicoTreino, series_feitas, repeticoes_feitas, carga_utilizada || 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Histórico de treino registrado', id: result.insertId });
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

  // aceitar valores numéricos 0/1 para ativa_planilhaTreino; checar apenas undefined/null
  if (id_usuario == null || !nome_planilhaTreino || !data_inicio || ativa_planilhaTreino == null) {
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

// ROTA POST - Cadastrar múltiplos treinos (exercícios vinculados a uma planilha)
app.post('/cadastraTreinos', async (req, res) => {
  const { id_planilhaTreino, treinos } = req.body;

  if (!id_planilhaTreino || !Array.isArray(treinos) || treinos.length === 0) {
    return res.status(400).json({ error: 'Informe id_planilhaTreino e um array de treinos' });
  }

  const p = db.promise();
  try {
    const values = [];

    for (const t of treinos) {
      let id_ex = t.id_exercicio || null;

      // If id_exercicio provided, verify it exists
      if (id_ex) {
        const [rows] = await p.query('SELECT id_exercicio FROM exercicio WHERE id_exercicio = ?', [id_ex]);
        if (!rows || rows.length === 0) {
          id_ex = null; // fallback to lookup by name
        }
      }

      // If no valid id, try lookup by name
      if (!id_ex && t.nome_exercicio) {
        const [rows2] = await p.query('SELECT id_exercicio FROM exercicio WHERE nome_exercicio = ? LIMIT 1', [t.nome_exercicio]);
        if (rows2 && rows2.length > 0) {
          id_ex = rows2[0].id_exercicio;
        }
      }

      // If still no id, insert new exercicio and use its id
      if (!id_ex && t.nome_exercicio) {
        const grupo = t.grupo_muscular || 'Geral';
        const descricao = t.descricao_exercicio || '';
        const [ins] = await p.query('INSERT INTO exercicio (nome_exercicio, grupo_muscular, descricao_exercicio) VALUES (?, ?, ?)', [t.nome_exercicio, grupo, descricao]);
        id_ex = ins.insertId;
      }

      if (!id_ex) {
        throw new Error('Não foi possível resolver id_exercicio para um dos treinos');
      }

      values.push([id_planilhaTreino, id_ex, t.series || 3, t.repeticoes_treino || 10, t.carga_treino || 0]);
    }

    if (values.length === 0) return res.status(400).json({ error: 'Nenhum treino válido para inserir' });

    const [result] = await p.query('INSERT INTO treino (id_planilhaTreino, id_exercicio, series, repeticoes_treino, carga_treino) VALUES ?', [values]);
    res.status(201).json({ message: 'Treinos cadastrados', inserted: result.affectedRows });
  } catch (err) {
    console.error('[ROTA] erro ao inserir treinos:', err.message);
    res.status(500).json({ error: err.message });
  }
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

  // aceitar meta_peso = 0 ou null/undefined; checar apenas id_usuario, data, peso como obrigatórios
  if (!id_usuario || !dia_pesoCorporal || !peso_pesoCorporal) {
    return res.status(400).json({ error: 'Preencha id_usuario, dia_pesoCorporal e peso_pesoCorporal!' });
  }

  const sql = 'INSERT INTO pesoCorporal (id_usuario, dia_pesoCorporal, peso_pesoCorporal, meta_peso) VALUES (?, ?, ?, ?)';
  db.query(sql, [id_usuario, dia_pesoCorporal, peso_pesoCorporal, meta_peso || null], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Peso corporal registrado com sucesso', id: result.insertId });
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



// ROTA GET - Buscar exercícios por grupo muscular
app.get('/exerciciosPorGrupo', (req, res) => {
  const { grupo_muscular } = req.query;
  console.log(`[ROTA] GET /exerciciosPorGrupo - grupo_muscular=${grupo_muscular}`);

  if (!grupo_muscular) {
    // Se não especificar grupo, retorna todos os exercícios
    db.query('SELECT * FROM exercicio ORDER BY grupo_muscular, nome_exercicio', (err, results) => {
      if (err) {
        console.error('[ROTA] erro ao buscar todos exercicios:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log(`[ROTA] retornando ${results.length} exercicios (todos)`);
      res.json(results);
    });
    return;
  }

  // Se especificar grupo, retorna só daquele grupo
  db.query('SELECT * FROM exercicio WHERE grupo_muscular = ? ORDER BY nome_exercicio', [grupo_muscular], (err, results) => {
    if (err) {
      console.error(`[ROTA] erro ao buscar exercicios grupo=${grupo_muscular}:`, err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log(`[ROTA] retornando ${results.length} exercicios para grupo=${grupo_muscular}`);
    res.json(results);
  });
});

// Simple status route to confirm the running server file and health
app.get('/_status', (req, res) => {
  res.json({ status: 'ok', file: __filename, pid: process.pid, time: new Date().toISOString() });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});