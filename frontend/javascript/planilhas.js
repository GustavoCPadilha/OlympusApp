document.getElementById('year').textContent = new Date().getFullYear();

const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
}

const userId = usuario.id;

function formatarDataBrasileira(dataString) {
    if (!dataString) {
        return "Não informado";
    }
    
    const data = new Date(dataString);

    if (isNaN(data.getTime())) {
        return dataString;
    }
    
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    
    return `${dia}/${mes}/${ano}`;
}

async function deletarPlanilha(id_planilha, nome_planilha) {
    if (!confirm(`Tem certeza que deseja deletar a planilha: "${nome_planilha}"? Esta ação não pode ser desfeita e deletará todos os treinos vinculados.`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/planilha/${id_planilha}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert(`Planilha "${nome_planilha}" deletada com sucesso!`);
            carregarPlanilhas();
        } else {
            const errorData = await response.json();
            alert(`Erro ao deletar planilha: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Erro de rede ao deletar planilha:', error);
        alert('Erro de conexão com o servidor ao deletar.');
    }
}

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

            if (planilhas.length === 0) {
                 container.innerHTML = '<p>Você não possui nenhuma planilha cadastrada.</p>';
                 return;
            }

            planilhas.forEach(planilha => {
                const dataFormatada = formatarDataBrasileira(planilha.data_inicio);

                container.innerHTML += `
                    <div class="card">
                        <h3>${planilha.nome_planilhaTreino}</h3>
                        <p>Início: ${dataFormatada}</p>
                        
                        <div class="card-actions">
                            <button onclick="abrirPlanilha(${planilha.id_planilhaTreino})">
                                Abrir Planilha
                            </button>
                            
                            <button 
                                onclick="deletarPlanilha(${planilha.id_planilhaTreino}, '${planilha.nome_planilhaTreino}')"
                                class="btn-delete-icon" 
                                title="Deletar Planilha"
                            >
                                🗑️
                            </button>
                        </div>
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