function setupPasswordToggle(passwordId, toggleId) {
    const pwd = document.getElementById(passwordId);
    const toggle = document.getElementById(toggleId);
    if (!pwd || !toggle) return;

    toggle.addEventListener('click', function (){
        if (pwd.type === 'password'){
            pwd.type = 'text';
            toggle.src = 'icons/olho.png';
            toggle.alt = 'Ocultar senha';
            toggle.title = 'Ocultar senha';
        } else {
            pwd.type = 'password';
            toggle.src = 'icons/olho-fechado.png';
            toggle.alt = 'Mostrar senha';
            toggle.title = 'Mostrar senha';
        }
    });
}

// Inicializa os toggles de senha
document.addEventListener('DOMContentLoaded', function() {
    // Para página de login
    setupPasswordToggle('password', 'togglePassword');
    
    // Para página de cadastro
    setupPasswordToggle('senha', 'togglePassword');
    setupPasswordToggle('confirmaSenha', 'toggleConfirmPassword');
});

// Função para acordeão dos exercícios
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.exercicio-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const isActive = content.classList.contains('active');
            
            // Fecha todos os painéis
            document.querySelectorAll('.exercicio-content').forEach(c => {
                c.classList.remove('active');
            });
            
            // Abre o painel clicado se não estava ativo
            if (!isActive) {
                content.classList.add('active');
            }
        });
    });
});

// Scroll suave para links da barra lateral
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.sidebar a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            if (section) {
                section.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Funções da página de perfil: abas, avatar preview, personalização e medidas
document.addEventListener('DOMContentLoaded', function () {
    const API = 'http://localhost:3000';
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    // Abas
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.getAttribute('data-target'));
            if (target) target.classList.add('active');
        });
    });

    // Personalização: avatar preview + salvar/load localStorage
    const personalizationForm = document.getElementById('personalizationForm');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const displayName = document.getElementById('displayName');
    const themeColor = document.getElementById('themeColor');

    function loadPersonalization() {
        try {
            const data = JSON.parse(localStorage.getItem('profile_personalization') || '{}');
            if (data.name) displayName.value = data.name;
            if (data.color) themeColor.value = data.color;
            if (data.avatar) avatarPreview.src = data.avatar;
            if (data.color) document.documentElement.style.setProperty('--cor-2', data.color);
        } catch (e) { /* ignore */ }
    }

    function readFileAsDataURL(file, cb) {
        const reader = new FileReader();
        reader.onload = () => cb(reader.result);
        reader.readAsDataURL(file);
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', () => {
            const f = avatarInput.files && avatarInput.files[0];
            if (f) {
                readFileAsDataURL(f, dataUrl => {
                    avatarPreview.src = dataUrl;
                });
            }
        });
    }

    if (personalizationForm) {
        personalizationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const avatarSrc = avatarPreview ? avatarPreview.src : '';
            const payload = {
                name: displayName.value || '',
                color: themeColor.value || '',
                avatar: avatarSrc
            };
            localStorage.setItem('profile_personalization', JSON.stringify(payload));
            if (payload.color) document.documentElement.style.setProperty('--cor-2', payload.color);
            alert('Personalização salva.');
        });
    }

    loadPersonalization();

    // Medidas: salvar/carregar via backend
    const measurementForm = document.getElementById('measurementForm');
    const measurementsTableBody = document.getElementById('measurementsTableBody');

    async function carregarMedidas() {
        if (!measurementsTableBody) return;
        measurementsTableBody.innerHTML = '';
        const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || 'null');
        if (!usuarioLocal || !usuarioLocal.id) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="14">Usuário não logado.</td>';
            measurementsTableBody.appendChild(tr);
            return;
        }

        try {
            // buscar pesos e medidas
            const [respPeso, respMed] = await Promise.all([
                fetch(`${API}/buscaPesoCorporal?id_usuario=${usuarioLocal.id}`),
                fetch(`${API}/buscaMedidaCorporal?id_usuario=${usuarioLocal.id}`)
            ]);

            const pesos = respPeso.ok ? await respPeso.json() : [];
            const meds = respMed.ok ? await respMed.json() : [];

            // Agregar por data (YYYY-MM-DD)
            const byDate = new Map();

            if (Array.isArray(pesos)) {
                pesos.forEach(p => {
                    const d = p.dia_pesoCorporal;
                    if (!byDate.has(d)) byDate.set(d, {});
                    byDate.get(d).date = d;
                    byDate.get(d).peso = p.peso_pesoCorporal;
                });
            }

            if (Array.isArray(meds)) {
                meds.forEach(m => {
                    const d = m.dia_medidaCorporal;
                    if (!byDate.has(d)) byDate.set(d, {});
                    const obj = byDate.get(d);
                    obj.date = d;
                    const reg = (m.regiao_medidaCorporal || '').toLowerCase();
                    
                    // mapear todas as regiões
                    if (reg.includes('ombro')) obj.ombros = m.medida_cm;
                    else if (reg.includes('peitoral')) obj.peitoral = m.medida_cm;
                    else if (reg.includes('bíceps e') || reg.includes('biceps e')) obj.bicepsE = m.medida_cm;
                    else if (reg.includes('bíceps d') || reg.includes('biceps d')) obj.bicepsD = m.medida_cm;
                    else if (reg.includes('antebraço e') || reg.includes('antebraco e')) obj.antebracoE = m.medida_cm;
                    else if (reg.includes('antebraço d') || reg.includes('antebraco d')) obj.antebracoD = m.medida_cm;
                    else if (reg.includes('cintura')) obj.cintura = m.medida_cm;
                    else if (reg.includes('quadril')) obj.quadril = m.medida_cm;
                    else if (reg.includes('coxa e')) obj.coxaE = m.medida_cm;
                    else if (reg.includes('coxa d')) obj.coxaD = m.medida_cm;
                    else if (reg.includes('panturrilha e')) obj.panturrilhaE = m.medida_cm;
                    else if (reg.includes('panturrilha d')) obj.panturrilhaD = m.medida_cm;
                });
            }

            const rows = Array.from(byDate.values()).sort((a,b)=> (b.date||'').localeCompare(a.date||''));
            if (rows.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="14">Nenhuma medida registrada.</td>';
                measurementsTableBody.appendChild(tr);
                return;
            }

            rows.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${formatDatePT(r.date)}</td>
                                <td>${r.peso ?? ''}</td>
                                <td>${r.ombros ?? ''}</td>
                                <td>${r.peitoral ?? ''}</td>
                                <td>${r.bicepsE ?? ''}</td>
                                <td>${r.bicepsD ?? ''}</td>
                                <td>${r.antebracoE ?? ''}</td>
                                <td>${r.antebracoD ?? ''}</td>
                                <td>${r.cintura ?? ''}</td>
                                <td>${r.quadril ?? ''}</td>
                                <td>${r.coxaE ?? ''}</td>
                                <td>${r.coxaD ?? ''}</td>
                                <td>${r.panturrilhaE ?? ''}</td>
                                <td>${r.panturrilhaD ?? ''}</td>`;
                measurementsTableBody.appendChild(tr);
            });
        } catch (err) {
            console.error('Erro ao carregar medidas:', err);
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="14">Erro ao carregar medidas.</td>';
            measurementsTableBody.appendChild(tr);
        }
    }

    if (measurementForm) {
        measurementForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const date = document.getElementById('mDate').value;
            const weight = document.getElementById('mWeight').value;
            const waist = document.getElementById('mWaist').value;
            const chest = document.getElementById('mChest').value;
            if (!date || !weight) { alert('Preencha pelo menos data e peso.'); return; }

            const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || 'null');
            if (!usuarioLocal || !usuarioLocal.id) { alert('Você precisa estar logado para salvar medidas.'); return; }

            try {
                // salvar peso como medida principal
                const resp = await fetch(`${API}/cadastraPesoCorporal`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_usuario: usuarioLocal.id, dia_pesoCorporal: date, peso_pesoCorporal: weight, meta_peso: null })
                });

                if (!resp.ok) {
                    const txt = await resp.text();
                    throw new Error(`${resp.status} ${txt}`);
                }

                // também salvar medida corporal se houver cintura/peito
                if (waist) {
                    await fetch(`${API}/cadastraMedidaCorporal`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_usuario: usuarioLocal.id, dia_medidaCorporal: date, regiao_medidaCorporal: 'Cintura', medida_cm: waist })
                    });
                }
                if (chest) {
                    await fetch(`${API}/cadastraMedidaCorporal`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_usuario: usuarioLocal.id, dia_medidaCorporal: date, regiao_medidaCorporal: 'Peito', medida_cm: chest })
                    });
                }

                await carregarMedidas();
                measurementForm.reset();
            } catch (err) {
                console.error('Erro ao salvar medida:', err);
                alert('Não foi possível salvar a medida. Tente novamente.');
            }
        });
    }

    carregarMedidas();

    function formatDatePT(d) {
        if (!d) return '';
        if (typeof d === 'string' && d.indexOf('-') >= 0) {
            const parts = d.split('-');
            if (parts.length >= 3) {
                const dayPart = parts[2].split('T')[0];
                return `${dayPart}/${parts[1]}/${parts[0]}`;
            }
        }
        try {
            const dt = new Date(d);
            return dt.toLocaleDateString('pt-BR');
        } catch (e) {
            return d;
        }
    }

    // Carrega histórico de treino para a aba Estatísticas
    async function loadTrainingHistory() {
        const ul = document.getElementById('trainingHistory');
        if (!ul) return;
        ul.innerHTML = '<li>Carregando histórico...</li>';

        if (!usuario || !usuario.id) {
            ul.innerHTML = '<li>Usuário não logado.</li>';
            return;
        }

        try {
            // busca todos os exercícios para mapear id -> nome
            const exResp = await fetch(`${API}/buscaExercicio`);
            const exercises = exResp.ok ? await exResp.json() : [];
            const exMap = new Map();
            exercises.forEach(e => exMap.set(e.id_exercicio, e.nome_exercicio || e.nome_exercicio));

            // busca histórico do usuário
            const histResp = await fetch(`${API}/buscaHistoricoTreino?id_usuario=${usuario.id}`);
            if (!histResp.ok) {
                ul.innerHTML = `<li>Erro ao carregar histórico: ${histResp.status}</li>`;
                return;
            }
            const history = await histResp.json();

            if (!Array.isArray(history) || history.length === 0) {
                ul.innerHTML = '<li>Nenhum registro de treino encontrado.</li>';
                return;
            }

            // ordenar por data desc
            history.sort((a,b)=> b.dia_historicoTreino.localeCompare(a.dia_historicoTreino) || b.id_historicoTreino - a.id_historicoTreino);

            ul.innerHTML = '';
            history.forEach(h => {
                const name = exMap.get(h.id_exercicio) || `Exercício #${h.id_exercicio}`;
                const date = formatDatePT(h.dia_historicoTreino);
                const series = h.series_feitas;
                const reps = h.repeticoes_feitas;
                const carga = (h.carga_utilizada != null) ? `${h.carga_utilizada}kg` : '';
                const li = document.createElement('li');
                li.textContent = `${date} — ${name} — ${series}x${reps} ${carga}`.trim();
                ul.appendChild(li);
            });
        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
            ul.innerHTML = '<li>Erro ao carregar histórico.</li>';
        }
    }

    loadTrainingHistory();

    // Carrega histórico de alimentação do usuário
    async function loadFoodHistory() {
        const ul = document.getElementById('foodHistory');
        if (!ul) return;
        ul.innerHTML = '<li>Carregando histórico...</li>';

        if (!usuario || !usuario.id) {
            ul.innerHTML = '<li>Usuário não logado.</li>';
            return;
        }

        try {
            // busca refeições do usuário (todas)
            const resp = await fetch(`${API}/buscaRefeicao?id_usuario=${usuario.id}`);
            if (!resp.ok) {
                ul.innerHTML = `<li>Erro ao carregar histórico de alimentação: ${resp.status}</li>`;
                return;
            }
            const items = await resp.json();
            if (!Array.isArray(items) || items.length === 0) {
                ul.innerHTML = '<li>Nenhuma refeição registrada.</li>';
                return;
            }

            // ordenar por data desc
            items.sort((a,b)=> b.dia_refeicao.localeCompare(a.dia_refeicao) || (b.id_refeicao||0)-(a.id_refeicao||0));

            ul.innerHTML = '';
            items.forEach(r => {
                const date = formatDatePT(r.dia_refeicao);
                const desc = r.descricao_refeicao || '';
                const li = document.createElement('li');
                li.textContent = `${date} — ${desc}`;
                ul.appendChild(li);
            });
        } catch (err) {
            console.error('Erro ao carregar histórico de alimentação:', err);
            ul.innerHTML = '<li>Erro ao carregar histórico de alimentação.</li>';
        }
    }

    loadFoodHistory();
});
