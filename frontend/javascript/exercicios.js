// Static exercises renderer — no backend calls
document.addEventListener('DOMContentLoaded', function() {
  const groups = [
    { id: 'peito', name: 'Peito' },
    { id: 'costas', name: 'Costas' },
    { id: 'quadriceps', name: 'Quadríceps' },
    { id: 'posterior', name: 'Posterior' },
    { id: 'panturrilha', name: 'Panturrilha' },
    { id: 'ombros', name: 'Ombros' },
    { id: 'triceps', name: 'Tríceps' },
    { id: 'biceps', name: 'Bíceps' },
    { id: 'antebraco', name: 'Antebraço' }
  ];

  // Hardcoded/static exercises (restore original/static list)
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

  // Render each group into its section
  groups.forEach(g => {
    const section = document.getElementById(g.id);
    if (!section) return;
    const listDiv = section.querySelector('.exercicios-lista') || (() => {
      const d = document.createElement('div'); d.className = 'exercicios-lista'; section.appendChild(d); return d;
    })();
    listDiv.innerHTML = '';

    const items = STATIC_EXERCISES[g.id] || [];
    items.forEach(ex => {
      const wrapper = document.createElement('div');
      wrapper.className = 'exercicio';

      const btn = document.createElement('button');
      btn.className = 'exercicio-btn';
      btn.textContent = ex.nome;

      const content = document.createElement('div');
      content.className = 'exercicio-content';
      content.style.display = 'none';

      const gifDiv = document.createElement('div');
      gifDiv.className = 'exercicio-gif';
      const img = document.createElement('img');
      img.src = 'gifs/placeholder.gif';
      img.alt = ex.nome;
      gifDiv.appendChild(img);

      const info = document.createElement('div');
      info.className = 'exercicio-info';
      const h3 = document.createElement('h3');
      h3.textContent = 'Descrição:';
      const p = document.createElement('p');
      p.textContent = ex.descricao || 'Sem descrição disponível.';
      info.appendChild(h3);
      info.appendChild(p);

      content.appendChild(gifDiv);
      content.appendChild(info);

      wrapper.appendChild(btn);
      wrapper.appendChild(content);
      listDiv.appendChild(wrapper);
    });
  });

  // Activate toggles
  document.querySelectorAll('.exercicio-btn').forEach(button => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      if (!content) return;
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });
  });
});
