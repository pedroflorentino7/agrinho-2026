// Estado do jogo
let production = 50;
let environment = 50;
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

// Animação de número
function animateNumber(element, newValue) {
    const oldValue = parseInt(element.innerText);
    if (oldValue === newValue) return;
    
    element.classList.add('animated-number');
    setTimeout(() => {
        element.classList.remove('animated-number');
    }, 300);
    
    // Animação suave do número
    let start = oldValue;
    let end = newValue;
    let duration = 300;
    let startTime = null;
    
    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const current = Math.floor(start + (end - start) * progress);
        element.innerText = current;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.innerText = end;
        }
    }
    
    requestAnimationFrame(animate);
}

// Atualiza toda interface com animações
function updateUI() {
    animateNumber(productionValueEl, Math.floor(production));
    animateNumber(environmentValueEl, Math.floor(environment));
    
    productionBarEl.style.width = `${production}%`;
    environmentBarEl.style.width = `${environment}%`;
    
    // Adicionar classe de animação nas barras
    productionBarEl.classList.add('animated-bar');
    environmentBarEl.classList.add('animated-bar');
    setTimeout(() => {
        productionBarEl.classList.remove('animated-bar');
        environmentBarEl.classList.remove('animated-bar');
    }, 500);
    
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
    
    // Animação de pulso no balanceStatus
    balanceStatusEl.parentElement.classList.add('pulse-animation');
    setTimeout(() => {
        balanceStatusEl.parentElement.classList.remove('pulse-animation');
    }, 1000);
    
    scoreValueEl.innerText = Math.floor(score);
    // Adicionar animação no score quando aumentar
    if (score > 0) {
        scoreValueEl.classList.add('animated-number');
        setTimeout(() => {
            scoreValueEl.classList.remove('animated-number');
        }, 300);
    }
}

// Atualiza pontuação baseado nos valores atuais
function updateScoreByBalance() {
    if (!gameActive) return;
    const diff = Math.abs(production - environment);
    let balancePoints = 0;
    if (diff <= 10) balancePoints = 5;
    else if (diff <= 20) balancePoints = 3;
    else if (diff <= 35) balancePoints = 1;
    else if (diff > 60) balancePoints = -2;
    
    if (balancePoints !== 0) {
        score = Math.max(0, score + balancePoints);
        // Efeito visual de +pontos
        if (balancePoints > 0) {
            showFloatingText(`+${balancePoints} 🌟`, 'green');
        } else if (balancePoints < 0) {
            showFloatingText(`${balancePoints} ⚠️`, 'red');
        }
    }
    
    if (production >= 40 && production <= 85 && environment >= 40 && environment <= 85) {
        score += 0.5;
        showFloatingText('+0.5 🌱', 'gold');
    }
    scoreValueEl.innerText = Math.floor(score);
}

// Mostrar texto flutuante
function showFloatingText(text, color) {
    const floatingDiv = document.createElement('div');
    floatingDiv.innerText = text;
    floatingDiv.style.position = 'fixed';
    floatingDiv.style.left = '50%';
    floatingDiv.style.top = '50%';
    floatingDiv.style.transform = 'translate(-50%, -50%)';
    floatingDiv.style.fontSize = '2rem';
    floatingDiv.style.fontWeight = 'bold';
    floatingDiv.style.color = color;
    floatingDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
    floatingDiv.style.zIndex = '1000';
    floatingDiv.style.pointerEvents = 'none';
    floatingDiv.style.animation = 'floatUp 1s ease-out forwards';
    document.body.appendChild(floatingDiv);
    
    setTimeout(() => {
        floatingDiv.remove();
    }, 1000);
}

// Verifica game over
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
        eventMessageEl.style.animation = 'shake 0.5s ease-in-out';
        
        // Desabilitar botões visualmente
        const btns = [plantBtn, intensifyBtn, techBtn, rotateBtn];
        btns.forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
        return true;
    }
    return false;
}

// Função principal que modifica valores
function modifyGame(prodDelta, envDelta, actionMessage) {
    if (!gameActive) return;
    
    const oldProduction = production;
    const oldEnvironment = environment;
    
    production = clamp(production + prodDelta);
    environment = clamp(environment + envDelta);
    
    let feedbackMsg = actionMessage;
    
    if (actionMessage.includes("Rotação")) {
        let avg = (production + environment) / 2;
        production = clamp(avg);
        environment = clamp(avg);
        feedbackMsg = "🔄 Rotação de Culturas equilibrou os indicadores!";
        showFloatingText('⚖️ EQUILÍBRIO!', '#e9c46a');
    }
    
    if (actionMessage.includes("Tecnologia") && production < environment) {
        feedbackMsg += " 🌱 A tecnologia verde favoreceu ainda mais o campo!";
    }
    
    updateUI();
    updateScoreByBalance();
    
    // Mostrar mensagem com animação
    eventMessageEl.classList.remove('slide-in');
    void eventMessageEl.offsetWidth; // Forçar reflow
    eventMessageEl.classList.add('slide-in');
    eventMessageEl.innerHTML = `📢 ${feedbackMsg} <br>🌽 Produção: ${Math.floor(production)}  🌳 Ambiente: ${Math.floor(environment)}`;
    
    const isOver = checkGameOver();
    if (!isOver && (prodDelta !== 0 || envDelta !== 0)) {
        triggerRandomEvent();
    }
    
    if (!isOver) {
        if (production > 85) {
            eventMessageEl.innerHTML += "<br>⚠️ Alerta: produção muito intensa! Risco ambiental.";
            showFloatingText('⚠️ ALERTA!', 'orange');
        } else if (environment > 85) {
            eventMessageEl.innerHTML += "<br>⚠️ Alerta: áreas de preservação cresceram demais, limite produção.";
            showFloatingText('⚠️ CUIDADO!', 'orange');
        } else if (production < 20) {
            eventMessageEl.innerHTML += "<br>⚠️ Fome iminente! Aumente a produção.";
        } else if (environment < 20) {
            eventMessageEl.innerHTML += "<br>⚠️ Desmatamento severo! Plante árvores.";
        }
    }
}

// Eventos aleatórios
function triggerRandomEvent() {
    if (!gameActive) return;
    if (Math.random() > 0.35) return;
    
    const events = [
        { msg: "💧 Chuva abundante! +Produção e +Ambiente", prod: 4, env: 3, color: "#4a9eff" },
        { msg: "🔥 Seca severa! -Produção e -Ambiente", prod: -5, env: -4, color: "#ff6b4a" },
        { msg: "🐞 Pragas controladas com biopesticidas! +Ambiente", prod: 0, env: 5, color: "#52b788" },
        { msg: "📉 Queda nos preços agrícolas -Produção", prod: -3, env: 1, color: "#e9c46a" },
        { msg: "🌱 Projeto de reflorestamento +Ambiente", prod: -1, env: 6, color: "#2a9d8f" },
        { msg: "🚜 Inovação em maquinário +Produção", prod: 6, env: -1, color: "#f4a261" },
        { msg: "🌾 Colheita recorde +7 Produção", prod: 7, env: -2, color: "#e76f51" }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    let newProd = clamp(production + randomEvent.prod);
    let newEnv = clamp(environment + randomEvent.env);
    
    production = newProd;
    environment = newEnv;
    updateUI();
    updateScoreByBalance();
    
    const eventText = `🌪️ EVENTO: ${randomEvent.msg}`;
    eventMessageEl.classList.remove('slide-in');
    void eventMessageEl.offsetWidth;
    eventMessageEl.classList.add('slide-in');
    eventMessageEl.innerHTML = `🌍 ${eventText}<br>🌽 Produção: ${Math.floor(production)}  🌳 Ambiente: ${Math.floor(environment)}<br>` + eventMessageEl.innerHTML.split('<br>')[0];
    
    showFloatingText('🎲 EVENTO!', randomEvent.color);
    checkGameOver();
}

// Reset do jogofunction resetGame() {
    production = 50;
    environment = 50;
    score = 0;
    gameActive = true;
    if (eventInterval) {
        clearInterval(eventInterval);
        eventInterval = null;
    }
    
    updateUI();
    updateScoreByBalance();
    gameOverMsgDiv.classList.add('hidden');
    eventMessageEl.classList.remove('slide-in');
    void eventMessageEl.offsetWidth;
    eventMessageEl.classList.add('slide-in');
    eventMessageEl.innerHTML = "🌾 Jogo reiniciado! Mantenha produção e ambiente entre 30 e 70 para pontuar. Equilíbrio é a chave! 🌱";
    
    // Reativar botões
    const btns = [plantBtn, intensifyBtn, techBtn, rotateBtn];
    btns.forEach(btn => {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    });
    
    showFloatingText('🔄 JOGO REINICIADO!', '#4a9eff');
    checkGameOver();
}

// Ações dos botões com efeitos de clique
function addButtonEffect(button) {
    button.addEventListener('click', (e) => {
        button.style.transform = 'scale(0.98)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    });
}

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
    modifyGame(0, 0, "🔄 Rotação de culturas + adubação verde");
}

// Vincular eventos
plantBtn.addEventListener('click', actionPlant);
intensifyBtn.addEventListener('click', actionIntensify);
techBtn.addEventListener('click', actionTech);
rotateBtn.addEventListener('click', actionRotate);
resetBtn.addEventListener('click', resetGame);

// Adicionar efeitos nos botões
[plantBtn, intensifyBtn, techBtn, rotateBtn, resetBtn].forEach(addButtonEffect);

// Inicializar UI
updateUI();
updateScoreByBalance();
eventMessageEl.innerHTML = "🌿 Bem-vindo, Agricultor Sustentável! Use os botões para equilibrar produção e meio ambiente. Cuidado com extremos!";

// Adicionar animação de partículas
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(255, 248, 225, ${Math.random() * 0.3})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `floatParticles ${Math.random() * 20 + 10}s linear infinite`;
        particle.style.animationDelay = Math.random() * 10 + 's';
        particlesContainer.appendChild(particle);
    }
}

createParticles();

// Evento periódico
setInterval(() => {
    if (gameActive) {
        const diff = Math.abs(production - environment);
        if (diff > 30) {
            eventMessageEl.innerHTML = `⚠️ Lembrete: diferença de ${Math.floor(diff)} pontos entre produção e ambiente. Busque o equilíbrio! ⚖️<br>` + eventMessageEl.innerHTML.split('<br>')[0];
        } else if (diff <= 10 && (production > 30 && environment > 30)) {
            eventMessageEl.innerHTML = `✨ Ótimo! Equilíbrio sustentável gerando +pontos! Mantenha o foco. ✨<br>` + eventMessageEl.innerHTML.split('<br>')[0];
            score += 1;
            scoreValueEl.innerText = Math.floor(score);
            showFloatingText('✨ BÔNUS EQUILÍBRIO! ✨', 'gold');
        }
    }
}, 8000);

// Estilo para animação flutuante
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(1.5);
        }
    }
`;
document.head.appendChild(style);