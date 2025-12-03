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

async function carregarTreino() {
    const container = document.getElementById("container-treino");

    // 1. BUSCAR DADOS DA PLANILHA SELECIONADA
    const planilha = await fetch(`${API}/buscaPlanilhaPorId?id=${id_planilha}`)
        .then(r => r.json());

    container.innerHTML = `<h1>${planilha.nome_planilhaTreino}</h1>`;

    // 2. BUSCAR EXERCÍCIOS DA PLANILHA
    const exercicios = await fetch(`${API}/buscaTreinosDaPlanilha?id_planilha=${id_planilha}`)
        .then(r => r.json());

    if (exercicios.length === 0) {
        container.innerHTML += "<h2>Essa planilha não tem exercícios cadastrados.</h2>";
        return;
    }

    for (const e of exercicios) {
        const historico = await fetch(
            `${API}/buscaHistoricoTreino?id_usuario=${usuarioAtivo}&id_exercicio=${e.id_exercicio}`
        ).then(r => r.json());

        const ultimo = historico.length > 0 ? historico[historico.length - 1] : null;

        container.innerHTML += gerarBlocoExercicio(e, ultimo);
    }

    // adiciona botão Finalizar Treino ao final da página
    const btn = document.createElement('button');
    btn.textContent = 'Finalizar Treino';
    btn.id = 'btn-finalizar-treino';
    btn.addEventListener('click', finalizarTreino);
    container.appendChild(btn);
}

function gerarBlocoExercicio(ex, ultimo) {
    const anterior = ultimo 
        ? `${ultimo.carga_utilizada}kg x ${ultimo.repeticoes_feitas}`
        : "—";

    let linhas = "";
    for (let i = 1; i <= ex.series; i++) {
        linhas += `
            <tr>
                <td>${i}</td>
                <td>${anterior}</td>
                <td><input type="number" value="${ex.carga_treino}" min="0"></td>
                <td><input type="number" value="${ex.repeticoes_treino}" min="1"></td>
                <td>
                    <button onclick="registrarSerie(this, ${ex.id_exercicio})">
                        <img src="icons/verificado-desmarcado.png">
                    </button>
                </td>
            </tr>`;
    }

    return `
        <div class="exercicio" data-id-exercicio="${ex.id_exercicio}">
            <h2>${ex.nome_exercicio}</h2>
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

async function registrarSerie(btn, id_exercicio) {
    let linha = btn.closest("tr");
    let img = btn.querySelector("img");

    let carga = linha.children[2].querySelector("input").value;
    let reps = linha.children[3].querySelector("input").value;

    // se já marcada como concluída e enviada, ignora (prevenir duplo envio)
    if (linha.classList.contains('done') && linha.dataset.posted === 'true') return;

    // Marcar como concluído
    img.src = "icons/verificado-marcado.png";
    linha.classList.add("done");

    try {
        const resp = await fetch(`${API}/cadastraHistoricoTreino`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_usuario: usuarioAtivo,
                id_exercicio,
                dia_historicoTreino: new Date().toISOString().split("T")[0],
                series_feitas: 1,
                repeticoes_feitas: reps,
                carga_utilizada: carga
            })
        });

        if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(`Erro ao salvar série: ${resp.status} ${txt}`);
        }

        // marcar como postado para evitar reenvio
        linha.dataset.posted = 'true';
    } catch (err) {
        console.error(err);
        // permite tentar novamente mais tarde; sinaliza falha visualmente
        linha.classList.add('error-post');
        alert('Não foi possível salvar a série agora. Tente novamente ao finalizar o treino.');
    }
}

// Finaliza o treino: garante que todas as séries marcadas sejam salvas no histórico
async function finalizarTreino() {
    const container = document.getElementById('container-treino');
    // encontrar todas as linhas marcadas como done
    const doneLines = Array.from(container.querySelectorAll('tr.done'));

    const pending = [];
    for (const linha of doneLines) {
        if (linha.dataset.posted === 'true') continue; // já enviado

        const imgBtn = linha.querySelector('button');
        const btnImg = imgBtn ? imgBtn.querySelector('img') : null;
        const carga = linha.children[2].querySelector('input').value;
        const reps = linha.children[3].querySelector('input').value;
        // tentar extrair id_exercicio a partir do botão onclick (fallback)
        let id_exercicio = null;
        if (imgBtn && imgBtn.getAttribute('onclick')) {
            const m = imgBtn.getAttribute('onclick').match(/registrarSerie\(this,\s*(\d+)\)/);
            if (m) id_exercicio = Number(m[1]);
        }

        // se não conseguir extrair, procurar no ancestor exercício (data attribute)
        if (!id_exercicio) {
            // tenta localizar id na tabela mais acima (atributo data-id-exercicio no tbody)
            const exBlock = linha.closest('.exercicio');
            if (exBlock && exBlock.dataset.idExercicio) id_exercicio = Number(exBlock.dataset.idExercicio);
        }

        if (!id_exercicio) continue; // ignora se não descobrir o id

        pending.push(fetch(`${API}/cadastraHistoricoTreino`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_usuario: usuarioAtivo,
                id_exercicio: id_exercicio,
                dia_historicoTreino: new Date().toISOString().split('T')[0],
                series_feitas: 1,
                repeticoes_feitas: reps,
                carga_utilizada: carga
            })
        }).then(async r => {
            if (!r.ok) {
                const t = await r.text();
                throw new Error(`${r.status} ${t}`);
            }
            linha.dataset.posted = 'true';
            if (btnImg) btnImg.src = 'icons/verificado-marcado.png';
        }).catch(err => {
            linha.classList.add('error-post');
            console.error('Erro ao postar série pendente:', err);
        }));
    }

    // aguarda todas as requisições
    await Promise.all(pending);

    // se houver alguma falha, avisa; caso contrário conclui
    const anyErrors = container.querySelector('.error-post');
    if (anyErrors) {
        alert('Algumas séries não puderam ser salvas. Verifique sua conexão e tente finalizar novamente.');
        return;
    }

    alert('Treino finalizado e salvo no histórico!');
    // redireciona para página de histórico ou planilhas
    window.location.href = 'planilhas.html';
}

carregarTreino();
