const API = "http://localhost:3000";
const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    alert("Usuário não está logado!");
    window.location.href = "login.html";
}

const usuarioAtivo = usuario.id;

// PEGAR ID DA PLANILHA SELECIONADA
const id_planilha = localStorage.getItem("planilhaSelecionada");

if (!id_planilha) {
    alert("Nenhuma planilha selecionada!");
    window.location.href = "planilhas.html";
}

// ------------------------------------
// 1. FUNÇÃO PRINCIPAL DE CARREGAMENTO
// ------------------------------------
async function carregarTreino() {
    const container = document.getElementById("container-treino");

    try {
        // 1. BUSCAR DADOS DA PLANILHA SELECIONADA
        const planilha = await fetch(`${API}/buscaPlanilhaPorId?id=${id_planilha}`).then(r => r.json());
        container.innerHTML = `<h1>${planilha.nome_planilhaTreino}</h1>`;

        // 2. BUSCAR EXERCÍCIOS DA PLANILHA
        const exercicios = await fetch(`${API}/buscaTreinosDaPlanilha?id_planilha=${id_planilha}`).then(r => r.json());

        if (exercicios.length === 0) {
            container.innerHTML += "<h2>Essa planilha não tem exercícios cadastrados.</h2>";
            return;
        }

        // 3. GERAR BLOCOS DE EXERCÍCIO
        for (const e of exercicios) {
            const historicosPorSerie = {};

            for (let i = 1; i <= e.series; i++) {
                const historicoDaSerie = await fetch(
                    `${API}/buscaHistoricoTreino?id_usuario=${usuarioAtivo}&id_exercicio=${e.id_exercicio}&series_feitas=${i}`
                ).then(r => r.json());

                if (historicoDaSerie.length > 0) {
                    historicosPorSerie[i] = historicoDaSerie[0];
                }
            }
            
            container.innerHTML += gerarBlocoExercicio(e, historicosPorSerie);
        }

        // adiciona botão Finalizar Treino ao final da página
        const btn = document.createElement('button');
        btn.textContent = 'Finalizar Treino';
        btn.id = 'btn-finalizar-treino';
        btn.addEventListener('click', finalizarTreino);
        container.appendChild(btn);

    } catch (err) {
        container.innerHTML = '<h1>Erro ao carregar treino. Tente novamente mais tarde.</h1>';
        console.error('Erro no carregamento do treino:', err);
    }
}

// ------------------------------------
// 2. FUNÇÃO QUE GERA O HTML DO EXERCÍCIO
// ------------------------------------
function gerarBlocoExercicio(ex, historicosPorSerie) {

    let linhas = "";
    for (let i = 1; i <= ex.series; i++) {
        const ultimo = historicosPorSerie[i]; 
        const anterior = ultimo 
            ? `${ultimo.carga_utilizada}kg x ${ultimo.repeticoes_feitas}`
            : "—";
        linhas += `
            <tr>
                <td>${i}</td> <td>${anterior}</td>
                <td><input type="number" value="${ex.carga_treino}" min="0"></td>
                <td><input type="number" value="${ex.repeticoes_treino}" min="1"></td>
                <td>
                    <button onclick="registrarSerie(this, ${ex.id_exercicio}, ${i})"> 
                        <img src="icons/verificado-desmarcado.png" alt="Marcar">
                    </button>
                </td>
            </tr>`;
    }

    return `
        <div class="exercicio" data-id-exercicio="${ex.id_exercicio}">
            <h2>${ex.nome_exercicio} (${ex.series} séries)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Série</th>
                        <th>Anterior</th>
                        <th>Kg</th>
                        <th>Reps</th>
                        <th>OK</th>
                    </tr>
                </thead>
                <tbody>${linhas}</tbody>
            </table>
        </div>
    `;
}

// ------------------------------------
// 3. FUNÇÃO QUE MARCA/DESMARCA A SÉRIE (TOGGLE)
// ------------------------------------
async function registrarSerie(btn, id_exercicio, numero_serie) {
    let linha = btn.closest("tr");
    let img = btn.querySelector("img");

    // SE JÁ ESTÁ MARCADA, DESMARCA
    if (linha.classList.contains('done')) {
        await desmarcarSerie(linha, img);
        return;
    }

    let cargaInput = linha.children[2].querySelector("input");
    let repsInput = linha.children[3].querySelector("input");

    let carga = cargaInput.value;
    let reps = repsInput.value;
    
    if (!carga || !reps || Number(carga) < 0 || Number(reps) < 1) {
        alert('Por favor, preencha a Carga (Kg) e Repetições (Reps) com valores válidos.');
        return;
    }

    try {
        const resp = await fetch(`${API}/cadastraHistoricoTreino`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_usuario: usuarioAtivo,
                id_exercicio,
                dia_historicoTreino: new Date().toISOString().split("T")[0],
                series_feitas: numero_serie, 
                
                repeticoes_feitas: reps,
                carga_utilizada: carga
            })
        });

        if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(`Erro ao salvar série: ${resp.status} ${txt}`);
        }
        
        // Assume que a API retorna o registro criado, incluindo o ID (o que é crucial para deletar)
        const novoRegistro = await resp.json();
        const idHistorico = novoRegistro.id; 

        // 2. Sucesso: Marca a linha visualmente e armazena o ID
        linha.dataset.idHistorico = idHistorico; // Armazena o ID no DOM
        linha.dataset.posted = 'true';
        linha.classList.remove("posting");
        linha.classList.add("done");
        img.src = "icons/verificado-marcado.png";

    } catch (err) {
        // 3. Falha: Remove o loading, mostra erro
        console.error(err);
        linha.classList.remove("posting");
        linha.classList.add('error-post');
        img.src = "icons/verificado-desmarcado.png"; 
        alert('Não foi possível salvar a série. Tente finalizar o treino novamente.');
    }
}

// ------------------------------------
// 4. FUNÇÃO QUE DESMARCA A SÉRIE (DELETE)
// ------------------------------------
async function desmarcarSerie(linha, img) {
    const idHistorico = linha.dataset.idHistorico;

    // Remove as classes de status imediatamente
    linha.classList.remove('done', 'error-post', 'posting');
    linha.dataset.posted = 'false';
    delete linha.dataset.idHistorico;
    img.src = "icons/verificado-desmarcado.png"; // Icone desmarcado

    if (!idHistorico) {
        console.warn("Série desmarcada, mas sem ID de histórico para deletar na API.");
        return; 
    }

    try {
        // Envia o DELETE para a API (Assumindo um endpoint DELETE /historicoTreino/:id)
        const resp = await fetch(`${API}/historicoTreino/${idHistorico}`, {
            method: "DELETE"
        });

        if (!resp.ok) {
            // Se falhar ao deletar, reverte o visual para "done" e avisa
            linha.dataset.idHistorico = idHistorico;
            linha.classList.add('done', 'error-post'); 
            img.src = "icons/verificado-marcado.png";
            throw new Error(`Erro ao deletar série: ${resp.status}`);
        }
    } catch (err) {
        console.error('Erro ao deletar registro:', err);
        alert('Não foi possível remover o registro do histórico.');
    }
}

// ------------------------------------
// 5. FUNÇÃO PARA FINALIZAR TREINO
// ------------------------------------
async function finalizarTreino() {
    
    const errors = document.querySelector('.error-post');
    if (errors) {
        alert('Você tem séries com erro de registro. Tente desmarcá-las e marcá-las novamente ou verifique a conexão.');
        return;
    }

    alert('Treino finalizado e salvo no histórico!');
    window.location.href = 'planilhas.html';
}

// Inicia o carregamento ao abrir a página
carregarTreino();