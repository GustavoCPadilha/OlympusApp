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

// Requisita os dados do alimento
async function registrarAlimento() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  let nome_comida = prompt('Digite o nome do alimento que você deseja registrar: ');
  let calorias = parseFloat(prompt('Digite a quantidade de calorias que esse alimento tem a cada 100g: '));
  let proteinas = parseFloat(prompt('Digite a quantidade de proteinas que esse alimento tem a cada 100g: '));
  let carboidratos = parseFloat(prompt('Digite a quantidade de carboidratos que esse alimento tem a cada 100g: '));
  let gorduras = parseFloat(prompt('Digite a quantidade de gorduras que esse alimento tem a cada 100g: '));
  await postAlimento(nome_comida, calorias, proteinas, carboidratos, gorduras);
}

// Recebe os dados do alimento e envia para o servidor
async function postAlimento(foodname, calories, proteins, carbohydrates, fats) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraAlimento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome_alimento: foodname,  
        calorias_alimento: calories,
        proteinas_alimento: proteins,
        carboidratos_alimento: carbohydrates,
        gorduras_alimento: fats
      })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      alert('✅ Alimento registrado com sucesso!');
      alert('Detalhes:', dados);
    } else {
      switch (resposta.status) {
        case 400:
          alert('⚠️ Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.');
          break;
        case 409:
          alert('❗ Esse alimento já foi cadastrado. Tente outro.');
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
    console.error('🚫 Erro ao tentar registrar alimento:', erro.message);
  }
}

// Requisita os dados da refeição
async function registrarRefeicao() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  let dia = getData();
  let descricao = prompt('Descreva a refeição:');
  await postRefeicao(usuarioAtivo, dia, descricao);
}

// Recebe os dados da refeição e envia para o servidor
async function postRefeicao(id_usuario, dia, descricao) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraRefeicao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: id_usuario,
        dia_refeicao: dia,
        descricao_refeicao: descricao
      })
    });
    const dados = await resposta.json();
    if (resposta.ok) {
      alert('✅ Refeição registrada com sucesso!');
      alert('Detalhes:', JSON.stringify(dados));
    } else {
      alert('Erro ao registrar refeição: ' + (dados.error || JSON.stringify(dados)));
    }
  } catch (erro) {
    console.error('Erro ao tentar registrar refeição:', erro.message);
  }
}

// Requisita os dados do exercício
async function registrarExercicio() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  let nome_exercicio = prompt('Digite o nome do exercício que você deseja cadastrar: ');
  let opcao_musculo = prompt('1 - Abdômen\n2 - Bíceps\n3 - Ombros\n4 - Costas\n5 - Panturilha\n6 - Peitoral\n7 - Posterior\n8 - Quadríceps\n9 - Tríceps\n10 - Cardio\nDigite qual o músculo foco deste exercício: ');
  let musculo = '';
  switch (opcao_musculo)
  {
    case '1': musculo = 'Abdômen'; break;
    case '2': musculo = 'Bíceps'; break;
    case '3': musculo = 'Ombros'; break;
    case '4': musculo = 'Costas'; break;
    case '5': musculo = 'Panturilha'; break;
    case '6': musculo = 'Peitoral'; break;
    case '7': musculo = 'Posterior'; break;
    case '8': musculo = 'Quadríceps'; break;
    case '9': musculo = 'Tríceps'; break;
    case '10': musculo = 'Cardio'; break;
    default: alert('Agrupamento muscular inválido, digite um agrupamento válido: '); return;
  }
  let descricao = prompt('Digite a descrição do exercício, se houver: ');
  await postExercicio(nome_exercicio, musculo, descricao);  
}

// Recebe os dados do exercício e envia para o servidor
async function postExercicio(exercicio, musculo, descricao) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraExercicio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome_exercicio: exercicio,  
        grupo_muscular: musculo,
        descricao_exercicio: descricao,
      })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      alert('✅ Exercício registrado com sucesso!');
      alert('Detalhes:', dados);
    } else {
      switch (resposta.status) {
        case 400:
          alert('⚠️ Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.');
          break;
        case 409:
          alert('❗ Esse exercício já foi cadastrado. Tente outro.');
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
    console.error('🚫 Erro ao tentar registrar exercício:', erro.message);
  }
}

// Requisita os dados do de uma planilha de treino
async function registrarPlanilhaTreino() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  let nome_planilhaTreino = prompt('Digite o nome da sua nova planilha de treino: ');
  alert('Digite a data de início dessa planilha: ');
  let data_inicio = getData();
  let ativa = prompt('Deseja tornar esta planilha como ativa? [S/N] ').toUpperCase();
  if (ativa == 'S') {
    ativa = 1;
  }
  else if (ativa == 'N') {
    ativa = 0;
  }
  await postPlanilhaTreino(nome_planilhaTreino, data_inicio, ativa, usuarioAtivo);
}

// Recebe os dados da planilha de treino e envia para o servidor
async function postPlanilhaTreino(nome_planilha, data_init, ativa, id_usuario) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraPlanilhaTreino', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome_planilhaTreino: nome_planilha,  
        data_inicio: data_init,
        ativa_planilhaTreino: ativa,
        id_usuario: id_usuario
      })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      alert('✅ Planilha registrada com sucesso!');
      alert('Detalhes:', JSON.stringify(dados));
    } else {
      switch (resposta.status) {
        case 400:
          alert('⚠️ Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.');
          break;
        case 409:
          alert('❗ Essa planilha já foi cadastrada. Tente outro nome.');
          break;
        case 500:
          alert('💥 Erro interno no servidor. Tente novamente mais tarde.');
          break;
        default:
          alert(`❗ Erro inesperado: ${resposta.status}`);
      }
    }
  } catch (erro) {
    console.error('🚫 Erro ao tentar registrar planilha:', erro.message);
  }
}

// Requisita os dados de uma progressão de carga
async function registrarProgressoCarga() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }

  // Busca os exercícios da planilha ativa do usuário
  const exercicios = await buscarExerciciosPorUsuario(usuarioAtivo);
  if (!exercicios || exercicios.length === 0) {
    alert('Nenhum exercício encontrado para sua planilha ativa!');
    return;
  }

  // Cria uma lista com os nomes para o usuário escolher
  const nomesExercicios = exercicios.map(e => e.nome_exercicio).join(', ');
  const nomeEscolhido = prompt(`Escolha um exercício: ${nomesExercicios}`);

  const exercicioSelecionado = exercicios.find(e => e.nome_exercicio.toLowerCase() === nomeEscolhido.toLowerCase());
  if (!exercicioSelecionado) {
    alert('Exercício não encontrado.');
    return;
  }

  const dia = getData();
  const repeticoes = prompt('Digite o número de repetições:');
  const carga = prompt('Digite a carga utilizada (kg):');

  await postProgressoCarga(usuarioAtivo, exercicioSelecionado.id_exercicio, dia, repeticoes, carga);
}

// Recebe os dados de uma progressão de carga e envia para o servidor
async function postProgressoCarga(id_usuario, id_exercicio, dia, repeticoes, carga) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraProgressoCarga', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: id_usuario,
        id_exercicio: id_exercicio,
        dia_progressoCarga: dia,
        repeticoes_progressoCarga: repeticoes,
        carga_progressoCarga: carga
      })
    });
    const dados = await resposta.json();
    if (resposta.ok) {
      alert('✅ Progresso de carga registrado com sucesso!');
      alert('Detalhes:', JSON.stringify(dados));
    } else {
      alert('Erro ao registrar progresso de carga: ' + (dados.error || JSON.stringify(dados)));
    }
  } catch (erro) {
    console.error('Erro ao tentar registrar progresso de carga:', erro.message);
  }
}

// Requisita os dados de uma medida corporal
async function registrarMedidaCorporal() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  let dia = getData();
  let regiao = prompt('Digite a região medida (ex: Braço, Cintura, Coxa, etc):');
  let medida = prompt('Digite a medida em cm:');
  await postMedidaCorporal(usuarioAtivo, dia, regiao, medida);
}

// Recebe os dados de uma medida corporal e envia para o servidor
async function postMedidaCorporal(id_usuario, dia, regiao, medida) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraMedidaCorporal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: id_usuario,
        dia_medidaCorporal: dia,
        regiao_medidaCorporal: regiao,
        medida_cm: medida
      })
    });
    const dados = await resposta.json();
    if (resposta.ok) {
      alert('✅ Medida corporal registrada com sucesso!');
      alert('Detalhes:', JSON.stringify(dados));
    } else {
      alert('Erro ao registrar medida corporal: ' + (dados.error || JSON.stringify(dados)));
    }
  } catch (erro) {
    console.error('Erro ao tentar registrar medida corporal:', erro.message);
  }
}

// Requisita os dados do peso corporal
async function registrarPesoCorporal() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  let dia = getData();
  let peso = prompt('Digite o peso (kg):');
  let meta = prompt('Digite a meta de peso (kg), se houver (ou deixe em branco):');
  meta = meta ? parseFloat(meta) : null;
  await postPesoCorporal(usuarioAtivo, dia, peso, meta);
}

// Recebe os dados do peso corporal e envia para o servidor
async function postPesoCorporal(id_usuario, dia, peso, meta) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraPesoCorporal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: id_usuario,
        dia_pesoCorporal: dia,
        peso_pesoCorporal: peso,
        meta_peso: meta
      })
    });
    const dados = await resposta.json();
    if (resposta.ok) {
      alert('✅ Peso corporal registrado com sucesso!');
      alert('Detalhes:', JSON.stringify(dados));
    } else {
      alert('Erro ao registrar peso corporal: ' + (dados.error || JSON.stringify(dados)));
    }
  } catch (erro) {
    console.error('Erro ao tentar registrar peso corporal:', erro.message);
  }
}

// Requisita os dados dos passos
async function registrarPassos() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  let dia = getData();
  let metros = prompt('Digite a quantidade de metros caminhados/corridos:');
  await postPassos(usuarioAtivo, dia, metros);
}

// Recebe os dados dos passos e envia para o servidor
async function postPassos(id_usuario, dia, metros) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraPassos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: id_usuario,
        dia_passos: dia,
        qtde_metros: metros
      })
    });
    const dados = await resposta.json();
    if (resposta.ok) {
      alert('✅ Passos registrados com sucesso!');
      alert('Detalhes:', JSON.stringify(dados));
    } else {
      alert('Erro ao registrar passos: ' + (dados.error || JSON.stringify(dados)));
    }
  } catch (erro) {
    console.error('Erro ao tentar registrar passos:', erro.message);
  }
}

// Requisita os dados das calorias diárias
async function registrarCaloriasDiarias() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }
  let data = getData();
  let calorias = prompt('Digite o total de calorias consumidas:');
  let proteinas = prompt('Digite o total de proteínas consumidas (g):');
  let carboidratos = prompt('Digite o total de carboidratos consumidos (g):');
  let gorduras = prompt('Digite o total de gorduras consumidas (g):');
  await postCaloriasDiarias(usuarioAtivo, data, calorias, proteinas, carboidratos, gorduras);
}

// Recebe os dados das calorias diárias e envia para o servidor
async function postCaloriasDiarias(id_usuario, data, calorias, proteinas, carboidratos, gorduras) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraCaloriasDiarias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: id_usuario,
        data_caloriasDiarias: data,
        calorias_totais: calorias,
        proteinas_caloriasDiarias: proteinas,
        carboidratos_caloriasDiarias: carboidratos,
        gorduras_caloriasDiarias: gorduras
      })
    });
    const dados = await resposta.json();
    if (resposta.ok) {
      alert('✅ Calorias diárias registradas com sucesso!');
      alert('Detalhes:', JSON.stringify(dados));
    } else {
      alert('Erro ao registrar calorias diárias: ' + (dados.error || JSON.stringify(dados)));
    }
  } catch (erro) {
    console.error('Erro ao tentar registrar calorias diárias:', erro.message);
  }
}

async function registrarRefeicaoAlimento() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }

  // Buscar refeições do usuário
  const refeicoes = await buscarRefeicoesDoUsuario(usuarioAtivo);
  if (refeicoes.length === 0) {
    alert('Você não possui refeições cadastradas!');
    return;
  }

  // Escolher refeição pelo nome
  const nomesRefeicoes = refeicoes.map(r => r.nome_refeicao).join('\n');
  const nomeRefeicao = prompt(`Escolha uma refeição:\n${nomesRefeicoes}`);
  const refeicaoSelecionada = refeicoes.find(r => r.nome_refeicao === nomeRefeicao);
  if (!refeicaoSelecionada) {
    alert('Refeição não encontrada!');
    return;
  }

  // Buscar alimentos disponíveis
  const alimentos = await buscarAlimentosParaRefeicao();
  const nomesAlimentos = alimentos.map(a => a.nome_alimento).join('\n');
  const nomeAlimento = prompt(`Escolha um alimento:\n${nomesAlimentos}`);
  const alimentoSelecionado = alimentos.find(a => a.nome_alimento === nomeAlimento);
  if (!alimentoSelecionado) {
    alert('Alimento não encontrado!');
    return;
  }

  // Receber gramas e registrar
  const qtde_gramas = prompt('Digite a quantidade em gramas:');
  await postRefeicaoAlimento(refeicaoSelecionada.id_refeicao, alimentoSelecionado.id_alimento, qtde_gramas);
}

async function postRefeicaoAlimento(id_refeicao, id_alimento, qtde_gramas) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraRefeicaoAlimento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_refeicao: id_refeicao,
        id_alimento: id_alimento,
        qtde_gramas: qtde_gramas
      })
    });
    const dados = await resposta.json();
    if (resposta.ok) {
      alert('✅ Alimento adicionado à refeição com sucesso!');
      alert('Detalhes:', JSON.stringify(dados));
    } else {
      alert('Erro ao adicionar alimento à refeição: ' + (dados.error || JSON.stringify(dados)));
    }
  } catch (erro) {
    console.error('Erro ao tentar adicionar alimento à refeição:', erro.message);
  }
}

// Requisita informações de um treino do usuário logado
async function registrarHistoricoTreino() {
  if (!usuarioAtivo) {
    alert('Usuário não está logado!');
    return;
  }

  // Busca os exercícios do usuário ativo
  const exercicios = await buscaExerciciosPorUsuario(usuarioAtivo);
  if (!exercicios || exercicios.length === 0) {
    alert('Nenhum exercício cadastrado para este usuário.');
    return;
  }

  // Mostra a lista dos nomes dos exercícios para o usuário escolher
  const nomesExercicios = exercicios.map(e => e.nome_exercicio).join('\n');
  const nomeEscolhido = prompt(`Escolha o exercício pelo nome:\n${nomesExercicios}`);

  // Encontra o exercício correspondente ao nome escolhido
  const exercicioSelecionado = exercicios.find(e => e.nome_exercicio.toLowerCase() === nomeEscolhido.toLowerCase());
  if (!exercicioSelecionado) {
    alert('Exercício não encontrado.');
    return;
  }

  let dia = getData();
  let series = prompt('Digite o número de séries feitas:');
  let repeticoes = prompt('Digite o número de repetições feitas:');
  let carga = prompt('Digite a carga utilizada (kg):');

  // Usa o ID do exercício encontrado automaticamente
  await postHistoricoTreino(usuarioAtivo.id_usuario, exercicioSelecionado.id_exercicio, dia, series, repeticoes, carga);
}

// Registra o histórico de treino do usuário logado e envia para o servidor
async function postHistoricoTreino(id_usuario, id_exercicio, dia, series, repeticoes, carga) {
  try {
    const resposta = await fetch('http://localhost:3000/cadastraHistoricoTreino', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: id_usuario,
        id_exercicio: id_exercicio,
        dia_historicoTreino: dia,
        series_feitas: series,
        repeticoes_feitas: repeticoes,
        carga_utilizada: carga
      })
    });
    const dados = await resposta.json();
    if (resposta.ok) {
      alert('✅ Histórico de treino registrado com sucesso!');
      alert('Detalhes:', JSON.stringify(dados));
    } else {
      alert('Erro ao registrar histórico de treino: ' + (dados.error || JSON.stringify(dados)));
    }
  } catch (erro) {
    console.error('Erro ao tentar registrar histórico de treino:', erro.message);
  }
}

// Função de login que armazena o usuário logado
async function fazerLogin(user, password) {
  try {
    const resposta = await fetch('http://localhost:3000/login', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user,
        senha: password,
      }),
    });

    const dados = await resposta.json();
    var ok = false;
    if (resposta.ok) {
      alert('✅ Login realizado com sucesso!');
      alert(`Bem-vindo ${dados.user.nome_usuario || user}`);
      usuarioAtivo = dados.user.id;
      ok = true;
      return ok;
    } else {
      usuarioAtivo = null;
      switch (resposta.status) {
        case 400:
          alert('⚠️ Requisição inválida. Verifique os dados enviados.');
          return ok;
        case 401:
          alert('🔒 Usuário ou senha incorretos.');
          return ok;
        case 404:
          alert('❌ Usuário não encontrado.');
          return ok;
        case 500:
          alert('💥 Erro interno no servidor. Tente novamente mais tarde.');
          return ok;
        default:
          alert(`❗ Erro inesperado: ${resposta.status}`);
      }
      return ok;
    }
  } catch (erro) {
    usuarioAtivo = null;
    console.error('🚫 Erro de conexão com o servidor:', erro.message);
    return false;
  }
}