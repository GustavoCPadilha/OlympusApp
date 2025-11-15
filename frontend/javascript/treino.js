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
        <div class="exercicio">
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

    // Marcar como concluído
    img.src = "icons/verificado-marcado.png";
    linha.classList.add("done");

    await fetch(`${API}/cadastraHistoricoTreino`, {
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
}

carregarTreino();
