document.getElementById('year').textContent = new Date().getFullYear();

const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
}

const userId = usuario.id;

// CARREGAR PLANILHAS DO USUÁRIO
function carregarPlanilhas() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.id) {
        alert("Usuário não encontrado.");
        return;
    }

    fetch(`http://localhost:3000/buscaPlanilhaTreino?id_usuario=${usuario.id}`)
        .then(res => res.json())
        .then(planilhas => {
            const container = document.getElementById("cardsUsuario");
            container.innerHTML = "";

            planilhas.forEach(planilha => {
                container.innerHTML += `
                    <div class="card">
                        <h3>${planilha.nome_planilhaTreino}</h3>
                        <p>Início: ${planilha.data_inicio || "Não informado"}</p>

                        <button onclick="abrirPlanilha(${planilha.id_planilhaTreino})">
                            Abrir Planilha
                        </button>
                    </div>
                `;
            });
        })
        .catch(err => console.error(err));
}
function abrirPlanilha(id_planilha) {
    localStorage.setItem("planilhaSelecionada", id_planilha);
    window.location.href = "treino.html";
}

carregarPlanilhas();