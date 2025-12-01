// Variável global para armazenar o usuário logado
let usuarioAtivo = null;

// Exibe mensagem de erro padrão
function mensagemErro() {
    alert('Opção inválida. Tente novamente!');
}

// Solicita uma data ao usuário (formato: yyyy-mm-dd)
function getData() {
    let dia_nasc = prompt('Digite o dia: ');
    let mes_nasc = prompt('Digite o mês: ');
    let ano_nasc = prompt('Digite o ano: ');
    let data = ano_nasc + '-' + mes_nasc + '-' + dia_nasc; 
    return data;
}

// Inicia o treino para o usuário logado
async function iniciarTreino() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  await iniciarTreinoComUsuario(usuarioAtivo);
}

// Inicia treino para um usuário específico e registra execução dos exercícios
async function iniciarTreinoComUsuario(id_usuario) {
  try {
    // Busca as planilhas do usuário
    const resposta = await fetch(`http://localhost:3000/buscaPlanilhaTreino?id_usuario=${id_usuario}`);
    const planilhas = await resposta.json();

    if (!planilhas.length) {
      alert('Você não possui planilhas de treino cadastradas.');
      return;
    }

    let lista = 'Escolha uma planilha para iniciar:\n';
    planilhas.forEach((p, i) => {
      lista += `${i + 1} - ${p.nome_planilhaTreino} (${p.ativa_planilhaTreino ? 'Ativa' : 'Inativa'})\n`;
    });

    const opcao = prompt(lista);
    const idx = parseInt(opcao) - 1;
    if (isNaN(idx) || idx < 0 || idx >= planilhas.length) {
      mensagemErro();
      return;
    }

    const planilhaSelecionada = planilhas[idx];
    alert(`Você iniciou a planilha: ${planilhaSelecionada.nome_planilhaTreino}`);

    // Busca os treinos (exercícios) dessa planilha
    const respTreinos = await fetch(`http://localhost:3000/buscaTreino?id_planilhaTreino=${planilhaSelecionada.id_planilhaTreino}`);
    const treinos = await respTreinos.json();

    if (!treinos.length) {
      alert('Esta planilha não possui treinos cadastrados.');
      return;
    }

    for (const t of treinos) {
      alert(`Exercício: ${t.nome_exercicio}\nSéries previstas: ${t.series}\nRepetições previstas: ${t.repeticoes_treino}\nCarga prevista: ${t.carga_treino}kg`);
      let series_feitas = prompt('Quantas séries você fez?');
      let repeticoes_feitas = prompt('Quantas repetições por série você fez?');
      let carga_utilizada = prompt('Qual carga utilizou (kg)?');
      let dia = getData();

      await postHistoricoTreino(
        usuarioAtivo,
        t.id_exercicio,
        dia,
        series_feitas,
        repeticoes_feitas,
        carga_utilizada
      );
    }

    alert('Treino registrado com sucesso!');

  } catch (erro) {
    alert('Erro ao iniciar treino: ' + erro.message);
  }
}

// ======= FUNÇÕES DE BUSCA =======

// Busca todos os exercícios cadastrados
async function buscaExercicio() {
  try {
    const resposta = await fetch('http://localhost:3000/buscaExercicio');
    const exercicios = await resposta.json();
    exercicios.forEach(exercicio => {
      console.log(`${exercicio.nome_exercicio}:
          - Grupo Muscular: ${exercicio.grupo_muscular}
          - Descrição: ${exercicio.descricao_exercicio}`);
    });
  }
  catch (erro) {
    console.error('Erro ao carregar os Exercícios:', erro)
  }
}

// Busca todas as planilhas de treino do usuário logado
async function buscaPlanilhaTreino() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  try {
    const resposta = await fetch(`http://localhost:3000/buscaPlanilhaTreino?id_usuario=${usuarioAtivo}`);
    const planilhas = await resposta.json();
    var ativa = '';
    planilhas.forEach(planilha => {
      ativa = planilha.ativa_planilhaTreino == 1 ? 'Ativa' : 'Inativa';
      console.log(`${planilha.nome_planilhaTreino}:
          - Data de início: ${planilha.data_inicio}
          - Ativa/Inativa: ${ativa}`);
    });
  }
  catch (erro) {
    console.error('Erro ao carregar a Planilha de treino:', erro)
  }
}

// // Calcula e mostra as calorias e macros de um dia escolhido pelo usuário
async function buscaCaloriasDiarias() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  let data = getData(); // Pergunta ao usuário o dia desejado

  try {
    const respRefeicoes = await fetch(`http://localhost:3000/buscaRefeicao?id_usuario=${usuarioAtivo}&dia_refeicao=${data}`);
    const refeicoes = await respRefeicoes.json();

    if (!refeicoes.length) {
      alert('Nenhuma refeição registrada para este dia.');
      return;
    }

    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;

    // Para cada refeição, buscar os alimentos e somar os macros
    for (const refeicao of refeicoes) {
      const respAlimentos = await fetch(`http://localhost:3000/buscaRefeicaoAlimento?id_refeicao=${refeicao.id_refeicao}`);
      const alimentos = await respAlimentos.json();

      for (const alimento of alimentos) {
        // alimento: { qtde_gramas, nome_alimento, calorias_alimento, proteinas_alimento, carboidratos_alimento, gorduras_alimento }
        const fator = alimento.qtde_gramas / 100;
        totalCalorias += alimento.calorias_alimento * fator;
        totalProteinas += alimento.proteinas_alimento * fator;
        totalCarboidratos += alimento.carboidratos_alimento * fator;
        totalGorduras += alimento.gorduras_alimento * fator;
      }
    }

    alert(
      `Resumo nutricional do dia ${data}:\n` +
      `Calorias totais: ${totalCalorias.toFixed(2)} kcal\n` +
      `Proteínas: ${totalProteinas.toFixed(2)} g\n` +
      `Carboidratos: ${totalCarboidratos.toFixed(2)} g\n` +
      `Gorduras: ${totalGorduras.toFixed(2)} g`
    );
  } catch (erro) {
    alert('Erro ao calcular calorias diárias: ' + erro.message);
  }
}

// Busca o histórico de treino do usuário logado
async function buscaHistoricoTreino() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  try {
    const resposta = await fetch(`http://localhost:3000/buscaHistoricoTreino?id_usuario=${usuarioAtivo}`);
    const historicos = await resposta.json();
    historicos.forEach(historico => {
      console.log(`- Data ${historico.dia_historicoTreino}:
          - Séries feitas: ${historico.series_feitas}
          - Repetições feitas: ${historico.repeticoes_feitas}
          - Carga utilizada: ${historico.carga_utilizada}kg`);
    });
  }
  catch (erro) {
    console.error('Erro ao carregar o Histórico de treino:', erro)
  }
}

// Busca as medidas corporais do usuário logado
async function buscaMedidaCorporal() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  try {
    const resposta = await fetch(`http://localhost:3000/buscaMedidaCorporal?id_usuario=${usuarioAtivo.id_usuario}`);
    const medidas = await resposta.json();
    medidas.forEach(medida => {
      console.log(`- Data ${medida.dia_medidaCorporal}:
          - Região: ${medida.regiao_medidaCorporal}
          - Medidas: ${medida.medida_cm}`);
    });
  }
  catch (erro) {
    console.error('Erro ao carregar as Medidas Corporais:', erro)
  }
}

// Busca o peso corporal do usuário logado
async function buscaPesoCorporal() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  try {
    const resposta = await fetch(`http://localhost:3000/buscaPesoCorporal?id_usuario=${usuarioAtivo}`);
    const pesos = await resposta.json();
    pesos.forEach(peso => {
      console.log(`- Data ${peso.dia_pesoCorporal}:
          - Peso: ${peso.peso_pesoCorporal }kg
          - Sua meta: ${peso.meta_peso}kg`);
    });
  }
  catch (erro) {
    console.error('Erro ao carregar o peso corporal:', erro)
  }
}

// Busca os passos do usuário logado
async function buscaPassos() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  try {
    const resposta = await fetch(`http://localhost:3000/buscaPassos?id_usuario=${usuarioAtivo}`);
    const passos = await resposta.json();
    passos.forEach(passos => {
      console.log(`- Data ${passos.dia_passos}:
          - Distância em metros: ${passos.qtde_metros}`);
    });
  }
  catch (erro) {
    console.error('Erro ao carregar os passos:', erro)
  }
}

// Busca o treino do usuário logado
async function buscaTreino() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  try {
    const resposta = await fetch(`http://localhost:3000/buscaTreino?id_usuario=${usuarioAtivo}`);
    const treinos = await resposta.json();
    treinos.forEach(treino => {
      console.log(`- Séries ${treino.series}:
          - Repetições: ${treino.repeticoes_treino}
          - Carga:  ${treino.carga_treino}`);
    });
  }
  catch (erro) {
    console.error('Erro ao carregar o Treino:', erro)
  }
}

// Busca os alimentos cadastrados
async function buscaAlimento() {
  try {
    const resposta = await fetch('http://localhost:3000/buscaAlimento');
    const alimentos = await resposta.json();
    alimentos.forEach(alimento => {
      console.log(`${alimento.nome_alimento}:
          - Calorias: ${alimento.calorias_alimento}kcal
          - Proteinas: ${alimento.proteinas_alimento}g
          - Carboidratos: ${alimento.carboidratos_alimento}g
          - Gorduras: ${alimento.gorduras_alimento}g`);
    });
  }
  catch (erro) {
    console.error('Erro ao carregar os alimentos:', erro)
  }
}

// Busca os exercicios do usuário logado
async function buscarExerciciosPorUsuario(id_usuario) {
  try {
    const res = await fetch(`http://localhost:3000/exerciciosDoUsuario/${id_usuario}`);
    if (!res.ok) throw new Error('Erro ao buscar exercícios');
    return await res.json();
  } catch (e) {
    console.error('Erro ao buscar exercícios:', e.message);
    return [];
  }
}

// Busca as refeições do usuário logado
async function buscarRefeicoesDoUsuario(id_usuario) {
  try {
    const res = await fetch(`http://localhost:3000/refeicoesDoUsuario/${id_usuario}`);
    if (!res.ok) throw new Error('Erro ao buscar refeições');
    return await res.json();
  } catch (e) {
    console.error(e.message);
    return [];
  }
}

async function buscarAlimentosParaRefeicao() {
  try {
    const res = await fetch('http://localhost:3000/alimentos');
    if (!res.ok) throw new Error('Erro ao buscar alimentos');
    return await res.json();
  } catch (e) {
    console.error(e.message);
    return [];
  }
}

// ======= FUNÇÕES DE REGISTRO =======

// Requisita os dados do usuário
async function registrarUsuario() {
    let nome_usuario = prompt('Digite seu nome completo: ');
    let email = prompt('Digite seu email: ');
    let ok = false;
    while (!ok)
    {
      var senha = prompt('Digite sua senha: ');
      let confirma_senha = prompt('Digite a senha novamente, para confirmação da senha: ');
      if (senha == confirma_senha)
      {
        ok = true;
        break;
      }
      alert('As senhas não batem... digite novamente!');
    }
    alert('Agora insira sua data de nascimento: ');
    let data_nascimento = getData();
    let sexo = prompt('Selecione seu sexo [M/F]: ').toUpperCase();
    let altura = prompt('Digite sua altura: ');
    let peso_usuario = prompt('Digite seu peso atual: ');
    await postUsuario(nome_usuario, email, senha, data_nascimento, sexo, altura, peso_usuario);
}

// Recebe os dados do usuário e envia para o servidor
async function postUsuario(user, mail, password, datebirth, sex, height, weight_user) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraUsuario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome_usuario: user,
        email: mail,
        senha: password,
        data_nascimento: datebirth,
        sexo: sex,
        altura: height,
        peso_usuario: weight_user
      })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      alert('✅ Usuário registrado com sucesso!');
      alert('Detalhes:', dados);
    } else {
      switch (resposta.status) {
        case 400:
          alert('⚠️ Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.');
          break;
        case 409:
          alert('❗ Esse nome de usuário já está em uso. Tente outro.');
          break;
        case 500:
          alert('💥 Erro interno no servidor. Tente novamente mais tarde.');
          break;
        default:
          alert(`❗ Erro inesperado: ${resposta.status}`);
      }

      console.debug('Detalhes do erro:', dados.mensagem || dados);
    }
  } catch (erro) {
    console.error('🚫 Erro ao tentar registrar usuário:', erro.message);
  }
}
