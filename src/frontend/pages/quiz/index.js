export default () => {
  const container = document.createElement("div");

  const perguntas = [
    {
      id: 1,
      tipo: "Múltipla Escolha",
      conteudo: "Você recebe uma ligação de alguém se identificando como funcionário do seu banco, afirmando que houve uma transferência suspeita na sua conta. Qual deve ser sua primeira atitude?",
      alternativas: [
        { key: "A", texto: "Desligar imediatamente e ligar para o número oficial do banco usando outro aparelho, se possível." },
        { key: "B", texto: "Confirmar seus dados pessoais e bancários para que o atendente possa cancelar a operação rapidamente." },
        { key: "C", texto: "Seguir as instruções de digitar a sua senha no teclado do telefone para validação de segurança." },
        { key: "D", texto: "Transferir o saldo restante para uma \"conta segura\" indicada pelo atendente." }
      ],
      alternativaCorreta: "A",
      explicacao: "Esta é a conduta correta. Os golpistas conseguem prender a linha telefônica fixa ou simular o número real do banco na tela do seu celular (técnica conhecida como spoofing). Desligar e usar outro aparelho quebra esse vínculo."
    },
    {
      id: 2,
      tipo: "Verdadeiro ou Falso",
      conteudo: "Os bancos costumam ligar para os clientes solicitando a senha, o código de segurança do cartão (CVV) ou tokens para fazer o estorno de uma transação errada.",
      alternativas: [
        { key: "Verdadeiro", texto: "Verdadeiro" },
        { key: "Falso", texto: "Falso" }
      ],
      alternativaCorreta: "Falso",
      explicacao: "Nenhum banco legítimo solicita senhas, CVV ou códigos de token por telefone sob nenhuma circunstância. Eles já possuem os sistemas internos e não precisam desses dados para cancelar operações."
    },
    {
      id: 3,
      tipo: "Múltipla Escolha",
      conteudo: "O que é o golpe da \"linha presa\" (ou retenção de linha), frequentemente usado em fraudes de falsas centrais?",
      alternativas: [
        { key: "A", texto: "Um vírus que bloqueia o sinal de internet do celular do cliente durante a noite." },
        { key: "B", texto: "O golpista não desliga a chamada e impede que a linha telefônica do cliente fique livre, interceptando a próxima ligação que a vítima tenta fazer para o banco." },
        { key: "C", texto: "Uma técnica onde o banco bloqueia temporariamente a conta do cliente por suspeita de fraude." },
        { key: "D", texto: "Um atraso proposital no envio de mensagens de SMS com o código de verificação." }
      ],
      alternativaCorreta: "B",
      explicacao: "Em telefones fixos, se o originador da chamada (o golpista) não desligar, a linha permanece ocupada. Quando a vítima tenta ligar para o banco em seguida, ela continua na mesma linha com o criminoso, que simula o atendimento bancário."
    },
    {
      id: 4,
      tipo: "Múltipla Escolha",
      conteudo: "Durante uma ligação da suposta central de segurança, o atendente diz que seu cartão foi clonado e que um motoboy do banco irá até sua casa recolhê-lo para perícia. Como proceder?",
      alternativas: [
        { key: "A", texto: "Entregar o cartão e a senha anotada em um papel, pois o atendente garantiu que o envelope estará lacrado." },
        { key: "B", texto: "Pedir a identificação do motoboy e entregar o cartão apenas se ele estiver uniformizado." },
        { key: "C", texto: "Recusar imediatamente e cortar o cartão ao meio (destruindo o chip), sabendo que bancos nunca mandam funcionários recolherem cartões." },
        { key: "D", texto: "Entregar apenas o cartão, mas reter a senha, acreditando que sem a senha eles não conseguirão usar." }
      ],
      alternativaCorreta: "C",
      explicacao: "Os bancos jamais enviam pessoas para retirar cartões físicos na residência dos clientes. Mesmo cortados, se o chip estiver intacto ou se os dados impressos estiverem visíveis, os criminosos ainda podem realizar fraudes."
    },
    {
      id: 5,
      tipo: "Múltipla Escolha",
      conteudo: "Os golpistas costumam colocar músicas de espera iguais às do banco e simular barulho de escritório (call center) ao fundo. Por que eles fazem isso?",
      alternativas: [
        { key: "A", texto: "Porque eles operam de dentro das próprias instalações das operadoras de telefonia." },
        { key: "B", texto: "É uma exigência legal para gravações de auditoria telefônica compulsória." },
        { key: "C", texto: "Para irritar o cliente e fazê-lo desligar a chamada mais rápido." },
        { key: "D", texto: "Para criar uma atmosfera de profissionalismo e legítimidade, induzindo a vítima a confiar no ambiente simulado." }
      ],
      alternativaCorreta: "D",
      explicacao: "Toda a estratégia se baseia na Engenharia Social. Os sons de fundo e as músicas idênticas servem para desarmar os alarmes de desconfiança da vítima, fazendo-a acreditar que está em um ambiente corporativo seguro."
    },
    {
      id: 6,
      tipo: "Verdadeiro ou Falso",
      conteudo: "Se no visor do seu celular aparece o nome exato do seu banco ou o número correto da central de atendimento (como 4004-XXXX), você pode ter certeza absoluta de que a ligação é segura.",
      alternativas: [
        { key: "Verdadeiro", texto: "Verdadeiro" },
        { key: "Falso", texto: "Falso" }
      ],
      alternativaCorreta: "Falso",
      explicacao: "Hoje os criminosos utilizam softwares de ID Spoofing (falsificação de identificador). Essa tecnologia permite mascarar o número real de origem da chamada e fazer com que apareça qualquer telefone ou nome na tela de quem está recebendo a ligação."
    },
    {
      id: 7,
      tipo: "Múltipla Escolha",
      conteudo: "Qual das seguintes frases ditas por um atendente telefônico é um sinal claro (red flag [sinal de alerta]) de que você está falando com um golpista de falsa central?",
      alternativas: [
        { key: "A", texto: "\"Para sua segurança, precisamos que você faça um Pix de teste para estornar a compra duplicada.\"" },
        { key: "B", texto: "\"Por favor, aguarde enquanto consulto o seu histórico de transações no sistema.\"" },
        { key: "C", texto: "\"Anote o protocolo de atendimento que geramos para este contato comercial.\"" },
        { key: "D", texto: "\"Caso queira, você pode verificar essas informações diretamente no nosso aplicativo oficial.\"" }
      ],
      alternativaCorreta: "A",
      explicacao: "Não existe \"Pix de teste\", \"Pix de estorno\" ou \"transferência de segurança\". Se o atendente pedir para você movimentar dinheiro, transferir recursos ou fazer pagamentos para resolver um problema na sua conta, é golpe."
    },
    {
      id: 8,
      tipo: "Múltipla Escolha",
      conteudo: "Se você perceber que caiu no golpe da falsa central e realizou transferências financeiras, qual deve ser a primeira ação imediata junto ao sistema bancário?",
      alternativas: [
        { key: "A", texto: "Aguardar 48 horas para ver se o dinheiro retorna automaticamente para o saldo da sua conta corrente." },
        { key: "B", texto: "Acionar o Mecanismo Especial de Devolução (MED) do Pix no seu banco e registrar um Boletim de Ocorrência." },
        { key: "C", texto: "Ligar de volta para o mesmo número que te contatou para exigir o estorno amigável." },
        { key: "D", texto: "Desinstalar o aplicativo do banco para evitar novos acessos dos criminosos na conta." }
      ],
      alternativaCorreta: "B",
      explicacao: "O MED é o sistema oficial criado pelo Banco Central justamente para casos de fraudes e golpes. Quanto mais rápido você acionar o seu banco para ativar o MED, maiores são as chances de o dinheiro ser bloqueado na conta de destino e devolvido."
    },
    {
      id: 9,
      tipo: "Múltipla Escolha",
      conteudo: "Por que os criminosos insistem muito para que a vítima não comente sobre a ligação com familiares ou pessoas próximas enquanto o processo está ocorrendo?",
      alternativas: [
        { key: "A", texto: "Para evitar que uma terceira pessoa perceba o absurdo da situação, quebre o estado de pânico e alerte a vítima sobre o golpe." },
        { key: "B", texto: "Devido a leis estritas de sigilo bancário que punem quem compartilha dados com terceiros." },
        { key: "C", texto: "Porque a gravação telefônica pode sofrer interferências eletromagnéticas com mais vozes na sala." },
        { key: "D", texto: "Para acelerar o tempo de atendimento geral da central telefônica e liberar a linha." }
      ],
      alternativaCorreta: "A",
      explicacao: "O isolamento psicológico é fundamental para o sucesso do golpe. Ao manter a vítima em estado de alerta e impedir que ela converse com alguém de fora, os criminosos evitam que uma opinião externa e racional identifique a fraude."
    },
    {
      id: 10,
      tipo: "Verdadeiro ou Falso",
      conteudo: "Os bancos reais possuem sistemas automatizados de detecção de fraudes e, quando bloqueiam uma transação suspeita, eles mesmos resolvem internamente ou pedem para você ir à agência, sem exigir que você faça novas transações por telefone.",
      alternativas: [
        { key: "Verdadeiro", texto: "Verdadeiro" },
        { key: "Falso", texto: "Falso" }
      ],
      alternativaCorreta: "Verdadeiro",
      explicacao: "O bloqueio preventivo serve justamente para paralisar o dinheiro e proteger o cliente. O banco legítimo resolve as questões de segurança de forma interna ou orienta o cliente a usar os canais oficiais (como o próprio app ou a agência física), sem nunca forçar o usuário a fazer transferências ativas para solucionar o problema."
    }
  ];

  let indexAtual = 0;
  let pontuacao = 0;
  let respondida = false;

  function renderizarPergunta() {
    if (indexAtual >= perguntas.length) {
      renderizarFimQuiz();
      return;
    }

    respondida = false;
    const p = perguntas[indexAtual];
    const total = perguntas.length;
    const progresso = (indexAtual / total) * 100;

    container.innerHTML = `
      <div class="page-container">
        <nav class="topbar">
          <span class="topbar-brand">True<span>Call</span></span>
          <button id="btnVoltar" class="btn-logout btn-secondary">← Voltar</button>
        </nav>

        <main class="quiz-main">
          <div class="quiz-container">
            <div class="quiz-header">
              <h1>Simulador de Golpes</h1>
              <p class="subtitulo">Quiz: Você sabe identificar o Golpe da Falsa Central Telefônica?</p>
            </div>

            <div class="quiz-card">
              <div class="quiz-meta">
                <span class="badge-tipo badge-${p.tipo === "Múltipla Escolha" ? "mult" : "vf"}">${p.tipo}</span>
                <span class="quiz-contador">Questão ${indexAtual + 1} de ${total}</span>
              </div>

              <!-- Barra de Progresso -->
              <div class="progress-container">
                <div class="progress-bar" style="width: ${progresso}%"></div>
              </div>

              <div class="scenario-box">
                <p class="scenario-text">${p.conteudo}</p>
              </div>

              <div class="quiz-actions" id="quizActions"></div>

              <div id="feedbackBox" class="feedback-box" style="display: none;">
                <div id="feedbackTitle" class="feedback-title"></div>
                <p id="feedbackText" class="feedback-text"></p>
                <button id="btnProxima" class="btn-proxima">Próxima Pergunta →</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    // Renderizar alternativas dinamicamente
    const acoesContainer = container.querySelector("#quizActions");
    acoesContainer.innerHTML = p.alternativas.map((alt) => {
      const isVF = alt.key === "Verdadeiro" || alt.key === "Falso";
      const textoBotao = isVF ? alt.texto : `<strong>${alt.key})</strong> ${alt.texto}`;
      const classeAdicional = isVF ? `btn-vf btn-${alt.key.toLowerCase()}` : "btn-opcao";
      
      return `
        <button class="btn-quiz ${classeAdicional}" data-choice="${alt.key}">
          ${textoBotao}
        </button>
      `;
    }).join("");

    // Eventos
    container.querySelector("#btnVoltar").addEventListener("click", voltarAoPainel);

    acoesContainer.querySelectorAll(".btn-quiz").forEach((btn) => {
      btn.addEventListener("click", () => verificarResposta(btn.dataset.choice));
    });
  }

  function verificarResposta(escolha) {
    if (respondida) return;
    respondida = true;

    const p = perguntas[indexAtual];
    const acertou = escolha === p.alternativaCorreta;

    if (acertou) {
      pontuacao++;
    }

    const acoesContainer = container.querySelector("#quizActions");
    const feedbackBox = container.querySelector("#feedbackBox");
    const feedbackTitle = container.querySelector("#feedbackTitle");
    const feedbackText = container.querySelector("#feedbackText");

    // Desativa botões de ação e aplica cores de acerto/erro
    acoesContainer.querySelectorAll(".btn-quiz").forEach((btn) => {
      btn.disabled = true;
      const escolhaBotao = btn.dataset.choice;

      if (escolhaBotao === p.alternativaCorreta) {
        // A correta sempre fica verde
        btn.classList.add("correta-highlight");
      } else if (escolhaBotao === escolha && !acertou) {
        // A errada escolhida pelo usuário fica vermelha
        btn.classList.add("errada-highlight");
      } else {
        // As demais ficam esmaecidas
        btn.classList.add("desativada-highlight");
      }
    });

    feedbackBox.style.display = "block";
    if (acertou) {
      feedbackTitle.className = "feedback-title success";
      feedbackTitle.innerHTML = "Resposta Correta!";
    } else {
      feedbackTitle.className = "feedback-title danger";
      feedbackTitle.innerHTML = "Resposta Incorreta!";
    }

    feedbackText.innerHTML = p.explicacao;

    container.querySelector("#btnProxima").addEventListener("click", () => {
      indexAtual++;
      renderizarPergunta();
    });
  }

  function renderizarFimQuiz() {
    const total = perguntas.length;
    let classeResultado = "";
    let tituloResultado = "";
    let conselho = "";

    const percentual = (pontuacao / total) * 100;

    if (percentual === 100) {
      classeResultado = "success";
      tituloResultado = "Especialista em Segurança (Nota 10/10)";
      conselho = "Excelente! Você conhece perfeitamente o modus operandi (método de operação) da fraude de Falsa Central Telefônica. Você está altamente protegido contra tentativas de engenharia social.";
    } else if (percentual >= 70) {
      classeResultado = "warning";
      tituloResultado = "Nível de Atenção Médio-Alto (Nota " + pontuacao + "/10)";
      conselho = "Bom trabalho! Você identificou a maioria das armadilhas da Falsa Central, mas ainda pode ser induzido ao erro em cenários mais refinados de ID Spoofing (mascaramento de chamadas) ou motoboy. Lembre-se: bancos nunca enviam funcionários para retirar cartões e nunca pedem Pix.";
    } else {
      classeResultado = "danger";
      tituloResultado = "Cuidado! Nível de Atenção Crítico (Nota " + pontuacao + "/10)";
      conselho = "Atenção máxima recomendada! Suas respostas indicam que você possui vulnerabilidades importantes que os criminosos de falsas centrais costumam explorar. Tenha sempre em mente: os bancos NUNCA pedem para você fazer transferências, digitar senhas ou entregar cartões a terceiros.";
    }

    container.innerHTML = `
      <div class="quiz-page">
        <nav class="topbar">
          <span class="topbar-brand">True<span>Call</span></span>
          <button id="btnVoltar" class="btn-voltar-top">Voltar</button>
        </nav>

        <main class="quiz-main">
          <div class="quiz-container">
            <div class="quiz-card end-card">
              <h2>Resultado do Simulado</h2>
              
              <div class="score-circle ${classeResultado}">
                <span class="score-number">${pontuacao}</span>
                <span class="score-total">de ${total}</span>
              </div>

              <div class="resultado-feedback">
                <h3 class="status-${classeResultado}">${tituloResultado}</h3>
                <p class="conselho-texto">${conselho}</p>
              </div>

              <div class="end-actions">
                <button id="btnReiniciar" class="btn-reiniciar">Tentar Novamente</button>
                <button id="btnVoltarPainel" class="btn-voltar-painel">Ir para o Dashboard</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    container.querySelector("#btnVoltar").addEventListener("click", voltarAoPainel);
    container.querySelector("#btnVoltarPainel").addEventListener("click", voltarAoPainel);
    container.querySelector("#btnReiniciar").addEventListener("click", () => {
      indexAtual = 0;
      pontuacao = 0;
      renderizarPergunta();
    });
  }

  function voltarAoPainel() {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.hash = "#dashboard";
    } else {
      window.location.hash = "#login";
    }
  }

  renderizarPergunta();

  return container;
};
