// Estado do jogo
let production = 50;      // 0-100
let environment = 50;     // 0-100
let score = 0;
let gameActive = true;
let eventInterval = null;

// Elementos DOM
const productionValueEl = document.getElementById('productionValue');
const environmentValueEl = document.getElementById('environmentValue');
const productionBarEl = document.getElementById('productionBar');
const environmentBarEl = document.getElementById('environmentBar');
const balanceStatusEl = document.getElementById('balanceStatus');
const scoreValueEl = document.getElementById('scoreValue');
const eventMessageEl = document.getElementById('eventMessage');
const gameOverMsgDiv = document.getElementById('gameOverMsg');

// Botões
const plantBtn = document.getElementById('plantBtn');
const intensifyBtn = document.getElementById('intensifyBtn');
const techBtn = document.getElementById('techBtn');
const rotateBtn = document.getElementById('rotateBtn');
const resetBtn = document.getElementById('resetBtn');

// Função auxiliar: clamp entre 0 e 100
function clamp(value) {
    return Math.min(100, Math.max(0, value));
}

// Atualiza toda interface
function updateUI() {
    productionValueEl.innerText = Math.floor(production);
    environmentValueEl.innerText = Math.floor(environment);
    productionBarEl.style.width = `${production}%`;
    environmentBarEl.style.width = `${environment}%`;
    
    // calcular diferença absoluta e status do equilíbrio
    const diff = Math.abs(production - environment);
    let statusText = "";
    let statusColor = "";
    if (diff <= 10) {
        statusText = "⚖️ Perfeito Equilíbrio! 🌟";
        statusColor = "#2a9d8f";
    } else if (diff <= 25) {
        statusText = "🌿 Quase lá...";
        statusColor = "#e9c46a";
    } else if (diff <= 45) {
        statusText = "⚠️ Desequilíbrio crítico!";
        statusColor = "#e76f51";
    } else {
        statusText = "💥 COLAPSO EM RISCO!";
        statusColor = "#d62828";
    }
    balanceStatusEl.innerText = statusText;
    balanceStatusEl.style.backgroundColor = statusColor;
    
    // Pontuação: bônus por equilíbrio (já calculado no updateScore, mas garantir exibição)
    scoreValueEl.innerText = Math.floor(score);
}

// Atualiza pontuação baseado nos valores atuais (quanto mais equilibrado, mais pontos)
function updateScoreByBalance() {
    if (!gameActive) return;
    const diff = Math.abs(production - environment);
    // Quanto menor diferença, maior ganho por ciclo: base 0.2 a 2.0 pontos por tick (mas chamado em ações)
    // Para manter progresso, vamos adicionar pontos a cada ação + tick extra a cada evento
    // Mas será chamado após cada modificação com bônus extra
    let balancePoints = 0;
    if (diff <= 10) balancePoints = 5;
    else if (diff <= 20) balancePoints = 3;
    else if (diff <= 35) balancePoints = 1;
    else if (diff > 60) balancePoints = -2; // penalidade leve por extremo desequilibrio
    
    if (balancePoints !== 0) {
        score = Math.max(0, score + balancePoints);
    }
    // Bônus extra se ambos estiverem acima de 40 e abaixo de 85 (produção sustentável)
    if (production >= 40 && production <= 85 && environment >= 40 && environment <= 85) {
        score += 0.5;
    }
    scoreValueEl.innerText = Math.floor(score);
}

// verifica game over (se produção <=0 ou >=100 OU ambiente <=0 ou >=100) -> degradação extrema
function checkGameOver() {
    if (!gameActive) return true;
    if (production <= 0 || production >= 100 || environment <= 0 || environment >= 100) {
        gameActive = false;
        if (eventInterval) clearInterval(eventInterval);
        eventInterval = null;
        let reason = "";
        if (production <= 0) reason = "🌽 Produção agrícola zerou! Fome e colapso rural...";
        else if (production >= 100) reason = "🚜 Superexploração do solo! Desertificação total.";
        else if (environment <= 0) reason = "🌲 Natureza destruída! Sem água, sem vida...";
        else if (environment >= 100) reason = "🌿 Natureza selvagem domina, produção inviável!";
        gameOverMsgDiv.classList.remove('hidden');
        gameOverMsgDiv.innerHTML = `💀 GAME OVER 💀 <br> ${reason} <br> Pontuação final: ${Math.floor(score)}`;
        eventMessageEl.innerHTML = `❌ Fim de jogo! ❌ ${reason} Clique em reiniciar.`;
        // desabilitar botões visualmente mas ainda com reset
        return true;
    }
    return false;
}

// Função principal que modifica valores e aplica consequências
function modifyGame(prodDelta, envDelta, actionMessage) {
    if (!gameActive) return;
    
    // aplicar modificações
    production = clamp(production + prodDelta);
    environment = clamp(environment + envDelta);
    
    // eventos especiais para certas ações
    let feedbackMsg = actionMessage;
    
    // Verifica bônus Rotação
    if (actionMessage.includes("Rotação")) {
        // efeito adicional: minimiza diferença instantaneamente
        let avg = (production + environment) / 2;
        production = clamp(avg);
        environment = clamp(avg);
        feedbackMsg = "🔄 Rotação de Culturas equilibrou os indicadores!";
    }
    
    // Tecnologia Verde: efeito extra sinergia se produção>ambiente?
    if (actionMessage.includes("Tecnologia")) {
        if (production < environment) {
            feedbackMsg += " 🌱 A tecnologia verde favoreceu ainda mais o campo!";
        }
    }
    
    updateUI();
    updateScoreByBalance();
    
    // Mostrar mensagem customizada
    eventMessageEl.innerHTML = `📢 ${feedbackMsg} <br>🌽 Produção: ${Math.floor(production)}  🌳 Ambiente: ${Math.floor(environment)}`;
    
    const isOver = checkGameOver();
    if (!isOver && (prodDelta !== 0 || envDelta !== 0)) {
        // Eventos aleatórios apenas se jogo ativo
        triggerRandomEvent();
    }
    if (isOver) return;
    
    // Feedback adicional se extremos
    if (production > 85) eventMessageEl.innerHTML += "<br>⚠️ Alerta: produção muito intensa! Risco ambiental.";
    else if (environment > 85) eventMessageEl.innerHTML += "<br>⚠️ Alerta: áreas de preservação cresceram demais, limite produção.";
    else if (production < 20) eventMessageEl.innerHTML += "<br>⚠️ Fome iminente! Aumente a produção.";
    else if (environment < 20) eventMessageEl.innerHTML += "<br>⚠️ Desmatamento severo! Plante árvores.";
}

// Eventos climáticos/período aleatórios que afetam ambos
function triggerRandomEvent() {
    if (!gameActive) return;
    // 30% de chance a cada ação de um evento natural (evita spam)
    if (Math.random() > 0.35) return;
    
    const events = [
        { msg: "💧 Chuva abundante! +Produção e +Ambiente", prod: 4, env: 3 },
        { msg: "🔥 Seca severa! -Produção e -Ambiente", prod: -5, env: -4 },
        { msg: "🐞 Pragas controladas com biopesticidas! +Ambiente, Produção estável", prod: 0, env: 5 },
        { msg: "📉 Queda nos preços agrícolas -Produção temporária", prod: -3, env: 1 },
        { msg: "🌱 Projeto de reflorestamento +Ambiente, impacto pequeno na produção", prod: -1, env: 6 },
        { msg: "🚜 Inovação em maquinário +Produção, pequeno impacto ambiental", prod: 6, env: -1 },
        { msg: "🌾 Colheita recorde +7 Produção mas desgaste do solo -2 Ambiente", prod: 7, env: -2 }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    let newProd = clamp(production + randomEvent.prod);
    let newEnv = clamp(environment + randomEvent.env);
    
    // aplicar evento
    production = newProd;
    environment = newEnv;
    updateUI();
    updateScoreByBalance();
    const eventText = `🌪️ EVENTO: ${randomEvent.msg}`;
    eventMessageEl.innerHTML = `🌍 ${eventText}<br>🌽 Produção: ${Math.floor(production)}  🌳 Ambiente: ${Math.floor(environment)}<br>` + eventMessageEl.innerHTML.split('<br>')[0];
    checkGameOver();
}

// Reset total do jogo
function resetGame() {
    production = 50;
    environment = 50;
    score = 0;
    gameActive = true;
    if (eventInterval) {
        clearInterval(eventInterval);
        eventInterval = null;
    }
    // Não manter intervalos extras, apenas ações manuais + eventos aleatórios (gatilho)
    updateUI();
    updateScoreByBalance();
    gameOverMsgDiv.classList.add('hidden');
    eventMessageEl.innerHTML = "🌾 Jogo reiniciado! Mantenha produção e ambiente entre 30 e 70 para pontuar. Equilíbrio é a chave! 🌱";
    checkGameOver(); // reset não causa game over
    // bônus de boas vindas
    score = 0;
    scoreValueEl.innerText = "0";
}

// Ações dos botões
function actionPlant() {
    modifyGame(-4, 8, "🌳 Plantio de árvores nativas: Ambiente melhorou, leve redução na área de cultivo.");
}
function actionIntensify() {
    modifyGame(9, -6, "🚜 Intensificação agrícola: produção aumentou mas causou erosão e perda de habitat.");
}
function actionTech() {
    modifyGame(5, 6, "💡 Tecnologia Verde (energia limpa + biotecnologia): produção e ambiente crescem juntos!");
}
function actionRotate() {
    modifyGame(0, 0, "🔄 Rotação de culturas + adubação verde"); // lógica especial lá
}

// Vincular eventos
plantBtn.addEventListener('click', actionPlant);
intensifyBtn.addEventListener('click', actionIntensify);
techBtn.addEventListener('click', actionTech);
rotateBtn.addEventListener('click', actionRotate);
resetBtn.addEventListener('click', resetGame);

// Inicializar UI
updateUI();
updateScoreByBalance();
eventMessageEl.innerHTML = "🌿 Bem-vindo, Agricultor Sustentável! Use os botões para equilibrar produção e meio ambiente. Cuidado com extremos!";

// Evento periódico suave (a cada 10 segundos lembrete de equilíbrio)
setInterval(() => {
    if (gameActive) {
        const diff = Math.abs(production - environment);
        if (diff > 30) {
            eventMessageEl.innerHTML = `⚠️ Lembrete: diferença de ${Math.floor(diff)} pontos entre produção e ambiente. Busque o equilíbrio! ⚖️<br>` + eventMessageEl.innerHTML.split('<br>')[0];
        } else if (diff <= 10 && (production > 30 && environment > 30)) {
            eventMessageEl.innerHTML = `✨ Ótimo! Equilíbrio sustentável gerando +pontos! Mantenha o foco. ✨<br>` + eventMessageEl.innerHTML.split('<br>')[0];
            score += 1;
            scoreValueEl.innerText = Math.floor(score);
        }
    }
}, 8000);