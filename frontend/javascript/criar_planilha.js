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
    { id_exercicio: 1, nome: 'Supino reto' },
    { id_exercicio: 2, nome: 'Supino inclinado' },
    { id_exercicio: 3, nome: 'Crucifixo' },
    { id_exercicio: 4, nome: 'Crossover' },
    { id_exercicio: 5, nome: 'Voador (peck deck)' },
  ],

  costas: [
    { id_exercicio: 6, nome: 'Puxada frontal' },
    { id_exercicio: 7, nome: 'Remada baixa' },
    { id_exercicio: 8, nome: 'Remada curvada' },
    { id_exercicio: 9, nome: 'Pull-up (barra fixa)' },
    { id_exercicio: 10, nome: 'Puxada na Polia' },
  ],

  quadriceps: [
    { id_exercicio: 11, nome: 'Agachamento (livre)' },
    { id_exercicio: 12, nome: 'Leg press 45°' },
    { id_exercicio: 13, nome: 'Cadeira extensora' },
    { id_exercicio: 14, nome: 'Afundo / Passada' },
  ],

  posterior: [
    { id_exercicio: 15, nome: 'Flexora' },
    { id_exercicio: 16, nome: 'Stiff' },
    { id_exercicio: 17, nome: 'Levantamento terra' },
    { id_exercicio: 18, nome: 'Back extension' },
  ],

  panturrilha: [
    { id_exercicio: 19, nome: 'Panturrilha em pé na máquina' },
    { id_exercicio: 20, nome: 'Panturrilha em pé livre' },
    { id_exercicio: 21, nome: 'Panturrilha sentado' },
    { id_exercicio: 22, nome: 'Panturrilha no leg press' },
  ],

  ombros: [
    { id_exercicio: 23, nome: 'Desenvolvimento de ombro (com halteres ou barra)' },
    { id_exercicio: 24, nome: 'Elevação lateral' },
    { id_exercicio: 25, nome: 'Elevação frontal' },
    { id_exercicio: 26, nome: 'Remada alta' },
  ],

  triceps: [
    { id_exercicio: 27, nome: 'Tríceps frânces' },
    { id_exercicio: 28, nome: 'Tríceps testa' },
    { id_exercicio: 29, nome: 'Tríceps coice com corda (no pulley)' },
    { id_exercicio: 30, nome: 'Tríceps mergulho no banco' },
    { id_exercicio: 31, nome: 'Tríceps na polia (corda ou barra)' },
  ],

  biceps: [
    { id_exercicio: 32, nome: 'Rosca direta com barra' },
    { id_exercicio: 33, nome: 'Rosca simultânea' },
    { id_exercicio: 34, nome: 'Rosca martelo' },
    { id_exercicio: 35, nome: 'Rosca biceps Scott unilateral com halter' },
    { id_exercicio: 36, nome: 'Rosca alternada com halteres' },
  ],

  antebraco: [
    { id_exercicio: 37, nome: 'Flexão de punho' },
    { id_exercicio: 38, nome: 'Rosca punho' },
    { id_exercicio: 39, nome: 'Suspensão na barra (Dead hang)' },
    { id_exercicio: 40, nome: 'Rosca Zottman' },
  ],
};

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
