// Script para criar uma planilha usando os exercícios estáticos
const API = 'http://localhost:3000';

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) {
  alert('Você precisa estar logado');
  window.location.href = 'login.html';
}

// Mesma lista estática usada em exercicios.js
// STATIC_EXERCISES_START

const STATIC_EXERCISES = {
  peito: [
    { id_exercicio: 1, nome: 'Supino reto', descricao: 'Supino com barra — 3 séries de 8-12 repetições.' },
    { id_exercicio: 29, nome: 'Supino inclinado', descricao: 'Foco na parte superior do peitoral.' },
    { id_exercicio: 30, nome: 'Crucifixo', descricao: 'Execução lenta para alongar o peitoral.' },
  ],
  costas: [
    { id_exercicio: null, nome: 'Puxada na barra', descricao: 'Puxada frente com pegada aberta.' },
    { id_exercicio: 9, nome: 'Remada curvada', descricao: 'Remada com barra para espessura das costas.' },
    { id_exercicio: 17, nome: 'Pullover', descricao: 'Alongamento e ativação do grande dorsal.' },
  ],
  quadriceps: [
    { id_exercicio: 2, nome: 'Agachamento livre', descricao: 'Base do treino de pernas — foque na técnica.' },
    { id_exercicio: 6, nome: 'Leg press', descricao: 'Boa opção para volume de treino.' },
    { id_exercicio: null, nome: 'Extensão de pernas', descricao: 'Isolamento do quadríceps.' },
  ],
  posterior: [
    { id_exercicio: 10, nome: 'Stiff', descricao: 'Foco em isquiotibiais e lombar.' },
    { id_exercicio: null, nome: 'Good morning', descricao: 'Mobilidade e força do posterior.' },
  ],
  panturrilha: [
    { id_exercicio: null, nome: 'Elevação de panturrilha em pé', descricao: 'Séries altas e controle.' },
    { id_exercicio: null, nome: 'Elevação sentado', descricao: 'Isolamento da panturrilha.' },
  ],
  ombros: [
    { id_exercicio: 21, nome: 'Desenvolvimento com halteres', descricao: 'Trabalha deltoide anterior e medial.' },
    { id_exercicio: 5, nome: 'Elevação lateral', descricao: 'Isolamento do deltoide lateral.' },
  ],
  triceps: [
    { id_exercicio: 26, nome: 'Tríceps testa', descricao: 'Boa para volume de tríceps.' },
    { id_exercicio: null, nome: 'Paralelas', descricao: 'Exercício composto para tríceps.' },
  ],
  biceps: [
    { id_exercicio: 4, nome: 'Rosca direta', descricao: 'Clássico para bíceps.' },
    { id_exercicio: 20, nome: 'Rosca martelo', descricao: 'Trabalha braquial e antebraço.' },
  ],
  antebraco: [
    { id_exercicio: 64, nome: 'Rosca punho', descricao: 'Fortalecimento do antebraço.' },
  ],
};
// STATIC_EXERCISES_END

// Nota: porque o banco já tem tabela `exercicio` real com ids, em um ambiente real
// você deveria sincronizar esses ids com a tabela `exercicio` e usar os ids verdadeiros.
// Aqui usaremos ids falsos >=1000 para evitar colisões e, se preferir, o backend pode
// mapear por nome.

const listaDiv = document.getElementById('lista-exercicios');
const selecionadosDiv = document.getElementById('selecionados');
const form = document.getElementById('form-planilha');

const selected = []; // { id_exercicio, nome, series, repeticoes, carga }

// Quando a página carrega, tentamos mapear os nomes estáticos para os IDs reais do DB
async function mapStaticToDbIds() {
  try {
    const resp = await fetch(`${API}/buscaExercicio`);
    if (!resp.ok) {
      console.warn('Não foi possível buscar exercícios do servidor, manter ids estáticos.');
      return;
    }
    const rows = await resp.json();
    // build name -> id map (normalize names)
    const map = new Map();
    rows.forEach(r => {
      if (r.nome_exercicio) map.set(r.nome_exercicio.trim().toLowerCase(), r.id_exercicio);
    });

    // Replace ids in STATIC_EXERCISES when name matches
    Object.keys(STATIC_EXERCISES).forEach(grp => {
      STATIC_EXERCISES[grp].forEach(ex => {
        const key = ex.nome.trim().toLowerCase();
        if (map.has(key)) {
          ex.id_exercicio = map.get(key);
        }
      });
    });

    console.log('Mapeamento estático->DB concluído');
  } catch (err) {
    console.warn('Erro ao mapear exercícios para ids do DB:', err.message);
  }
}

async function renderAvailable() {
  // attempt to map to DB ids first
  await mapStaticToDbIds();

  // then render
  listaDiv.innerHTML = '';
  Object.entries(STATIC_EXERCISES).forEach(([grupo, items]) => {
    const gDiv = document.createElement('div');
    gDiv.className = 'grupo';
    const h = document.createElement('h3');
    h.textContent = grupo.charAt(0).toUpperCase() + grupo.slice(1);
    gDiv.appendChild(h);

    items.forEach(ex => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = ex.nome;
      b.addEventListener('click', () => addToSelected(ex, grupo));
      gDiv.appendChild(b);
    });

    listaDiv.appendChild(gDiv);
  });
}

function addToSelected(ex, grupo) {
  if (selected.find(s => s.id_exercicio === ex.id_exercicio)) return;
  const item = { id_exercicio: ex.id_exercicio, nome: ex.nome, grupo_muscular: grupo, series: 3, repeticoes: 10, carga: 0 };
  selected.push(item);
  renderSelected();
}

function removeFromSelected(id) {
  const idx = selected.findIndex(s => s.id_exercicio === id);
  if (idx >= 0) selected.splice(idx, 1);
  renderSelected();
}

function renderSelected() {
  selecionadosDiv.innerHTML = '';
  if (selected.length === 0) {
    selecionadosDiv.textContent = 'Nenhum exercício selecionado.';
    return;
  }

  selected.forEach(s => {
    const row = document.createElement('div');
    row.className = 'sel-item';
    row.innerHTML = `
      <strong>${s.nome}</strong>
      Série(s): <input type="number" min="1" value="${s.series}" data-id="${s.id_exercicio}" class="inp-series">
      Reps: <input type="number" min="1" value="${s.repeticoes}" data-id="${s.id_exercicio}" class="inp-reps">
      Kg: <input type="number" min="0" value="${s.carga}" data-id="${s.id_exercicio}" class="inp-carga">
      <button type="button" data-id="${s.id_exercicio}" class="btn-remove">Remover</button>
    `;

    selecionadosDiv.appendChild(row);
  });

  // attach handlers
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromSelected(Number(btn.dataset.id)));
  });
  document.querySelectorAll('.inp-series').forEach(inp => {
    inp.addEventListener('change', () => {
      const id = Number(inp.dataset.id);
      const s = selected.find(x => x.id_exercicio === id);
      if (s) s.series = Number(inp.value) || 1;
    });
  });
  document.querySelectorAll('.inp-reps').forEach(inp => {
    inp.addEventListener('change', () => {
      const id = Number(inp.dataset.id);
      const s = selected.find(x => x.id_exercicio === id);
      if (s) s.repeticoes = Number(inp.value) || 1;
    });
  });
  document.querySelectorAll('.inp-carga').forEach(inp => {
    inp.addEventListener('change', () => {
      const id = Number(inp.dataset.id);
      const s = selected.find(x => x.id_exercicio === id);
      if (s) s.carga = Number(inp.value) || 0;
    });
  });
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  if (selected.length === 0) {
    alert('Escolha ao menos um exercício.');
    return;
  }

  const nome = document.getElementById('nomePlanilha').value.trim();
  const dataInicio = document.getElementById('dataInicio').value;

  if (!nome || !dataInicio) {
    alert('Preencha nome e data de início');
    return;
  }

  try {
    // 1) cria planilha
    const resp = await fetch(`${API}/cadastraPlanilhaTreino`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: usuario.id, nome_planilhaTreino: nome, data_inicio: dataInicio, ativa_planilhaTreino: 0 })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Erro criando planilha: ${resp.status} ${txt}`);
    }

    const body = await resp.json();
    const id_planilha = body.id;

    // 2) envia treinos
    const treinosPayload = selected.map(s => ({ id_exercicio: s.id_exercicio, nome_exercicio: s.nome, grupo_muscular: s.grupo_muscular, series: s.series, repeticoes_treino: s.repeticoes, carga_treino: s.carga }));

    const resp2 = await fetch(`${API}/cadastraTreinos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_planilhaTreino: id_planilha, treinos: treinosPayload })
    });

    if (!resp2.ok) {
      const txt = await resp2.text();
      throw new Error(`Erro cadastrando treinos: ${resp2.status} ${txt}`);
    }

    alert('Planilha criada com sucesso!');
    window.location.href = 'planilhas.html';

  } catch (err) {
    console.error(err);
    alert('Erro ao criar planilha: ' + err.message);
  }
});

renderAvailable();
renderSelected();
