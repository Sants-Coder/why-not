//spotligh

let spotlightOpen = false;
let spotlightIndex = -1;
let spotlightData = [];

async function loadSpotlightData() {
    try {
        const response = await fetch("data.json");
        spotlightData = await response.json();
    } catch (error) {
        console.error("Erro ao carregar data.json:", error);
    }
}

function openSpotlight() {
    const spotlight = document.getElementById("spotlight");
    const input = document.getElementById("spotlightInput");

    // Mostrar spotlight
    spotlight.style.display = "flex";
    spotlight.classList.add("open");

    // Travar scroll
    document.body.classList.add("no-scroll");

    input.value = "";
    input.focus();
    renderSpotlightResults(spotlightData);

    spotlightOpen = true;
    spotlightIndex = -1;
}

function closeSpotlight() {
    const spotlight = document.getElementById("spotlight");

    spotlight.classList.remove("open");

    setTimeout(() => {
        spotlight.style.display = "none";
    }, 150);

    // Destravar scroll
    document.body.classList.remove("no-scroll");

    spotlightOpen = false;
    spotlightIndex = -1;
}


// Mostra os resultados da busca na tela
function renderSpotlightResults(results) {
    const list = document.getElementById("spotlightResults");
    list.innerHTML = "";

    results.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = item.label;
        li.dataset.index = index;
        li.onclick = () => goToSection(item.target);

        list.appendChild(li);
    });
}

// Leva o usuário para a seção clicada
function goToSection(target) {
    closeSpotlight();
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ behavior: "smooth" });
    }
}

// Filtra os resultados enquanto o usuário digita
function filterSpotlight(term) {
    term = term.toLowerCase();

    const filtered = spotlightData.filter(item =>
        item.keywords.toLowerCase().includes(term) || //se nao
        item.label.toLowerCase().includes(term)
    );

    renderSpotlightResults(filtered);
}

// Permite navegar nos resultados com as setas (↑ ↓) e Enter
function navigateSpotlight(event) {
    const list = document.querySelectorAll("#spotlightResults li");

    if (list.length === 0) return;

    if (event.key === "ArrowDown") {
        spotlightIndex = (spotlightIndex + 1) % list.length;
    } else if (event.key === "ArrowUp") {
        spotlightIndex = (spotlightIndex - 1 + list.length) % list.length;
    }

    list.forEach(li => li.classList.remove("selected"));
    list[spotlightIndex].classList.add("selected");

    if (event.key === "Enter") {
        list[spotlightIndex].click();
    }
}

// Fica "ouvindo" as teclas que o usuário aperta
document.addEventListener("keydown", (event) => {
    // Atalho para abrir a busca: CTRL + K
    if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSpotlight();
        return;
    }

    // Atalho para fechar a busca: tecla ESC
    if (event.key === "Escape" && spotlightOpen) {
        closeSpotlight();
        return;
    }

    // Navegação com as setas e Enter na busca
    if (spotlightOpen && ["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
        event.preventDefault();
        navigateSpotlight(event);
    }
});

// Input da busca
document.addEventListener("input", (event) => { // Evento para quando o usuário digita no campo
    if (event.target.id === "spotlightInput") {
        filterSpotlight(event.target.value);
    }
});

loadSpotlightData(); // Carrega os dados do arquivo data.json

// Fecha o Spotlight ao clicar fora com container dele
document.addEventListener("click", function (event) {
    const spotlight = document.getElementById("spotlight");
    const box = document.querySelector(".spotlight-box");

    if (!spotlightOpen) return;

    // clicou dentro da caixa, não fecha
    if (box.contains(event.target)) return;

    // se clicou no botão de abrir o spotlight, não vai fecha
    if (event.target.closest(".btn-buscar")) return;

    closeSpotlight();
});


//quiz

(function () {
    const form = document.getElementById('quizForm');
    const submit = document.getElementById('quizSubmit');
    const resetBtn = document.getElementById('quizReset');
    const resultEl = document.getElementById('quizResult');

    function getAnswers() {
        return {
            a: document.querySelector('input[name="q1"]:checked')?.value || "",
            b: document.querySelector('input[name="q2"]:checked')?.value || "",
            c: document.querySelector('input[name="q3"]:checked')?.value || ""
        };
    }

    function computeProfile({ a, b, c }) {
        const score = { A: 0, B: 0, C: 0 };
        [a, b, c].forEach(v => v && (score[v]++));
        return Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
    }

    function getProfileText(type) {
        const data = {
            A: {
                title: "Força: Persistência",
                body: "Você vence pela disciplina e repetição constante."
            },
            B: {
                title: "Força: Visão",
                body: "Você é movido por propósito e clareza de futuro."
            },
            C: {
                title: "Força: Combatividade",
                body: "Você cresce enfrentando desafios de frente."
            }
        };
        return data[type];
    }

    submit.addEventListener('click', () => {
        const answers = getAnswers();
        if (!answers.a || !answers.b || !answers.c) {
            alert("Responda todas as perguntas.");
            return;
        }
        const type = computeProfile(answers);
        const { title, body } = getProfileText(type);

        resultEl.hidden = false;
        resultEl.innerHTML = `
            <div class="result-title">${title}</div>
            <div class="result-body">${body}</div>
        `;

        resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    resetBtn.addEventListener('click', () => {
        form.reset();
        resultEl.hidden = true;
    });
})();


//Musica

(function () {
    const toggle = document.getElementById('musicToggle');
    const menu = document.getElementById('musicMenu');
    const closeBtn = document.getElementById('musicClose');
    const tracks = Array.from(document.querySelectorAll('.music-track'));
    const vol = document.getElementById('musicVolume');
    const stopBtn = document.getElementById('musicStop');
    const fadeTime = 400; // ms fade in/out

    // Cria o elemento de áudio
    const audio = new Audio();
    audio.loop = true;
    audio.volume = parseFloat(vol.value || 0.35);

    let currentKey = null;
    let isPlaying = false;
    let fadeInterval = null; // Variável para controlar o efeito de fade

    // helpers: fade in/out
    function fadeTo(targetVolume, time = fadeTime) {
        if (fadeInterval) clearInterval(fadeInterval);
        const stepTime = 40;
        const steps = Math.max(1, Math.round(time / stepTime));
        const start = audio.volume;
        const delta = (targetVolume - start);
        let i = 0;
        fadeInterval = setInterval(() => {
            i++;
            const v = Math.min(1, Math.max(0, start + (delta * (i / steps))));
            audio.volume = v;
            if (i >= steps) {
                clearInterval(fadeInterval);
                fadeInterval = null;
                audio.volume = targetVolume;
            }
        }, stepTime);
    }

    function playTrack(src, key) {
        if (currentKey === key && isPlaying) return;
        // Se outra música já estiver tocando, diminui o volume antes de trocar
        if (isPlaying) {
            // Diminui o volume até 0, troca a música e aumenta o volume de novo
            fadeTo(0, 200);
            setTimeout(() => {
                audio.src = src;
                audio.play().then(() => {
                    isPlaying = true;
                    currentKey = key;
                    fadeTo(parseFloat(vol.value), 300);
                    updateUI();
                }).catch(() => {
                    /* play prevented */
                });
            }, 220);
            return;
        }
        // Se nada estiver tocando, apenas define a música e toca com fade
        audio.src = src;
        audio.play().then(() => {
            isPlaying = true;
            currentKey = key;
            audio.volume = 0;
            fadeTo(parseFloat(vol.value), 400);
            updateUI();
        }).catch((err) => {
            // Navegadores podem bloquear o play automático, mas como foi um clique do usuário, o navegador entende e tende a funciona
            console.warn('play prevented', err);
        });
    }

    function stopMusic() {
        if (!isPlaying) return;
        fadeTo(0, 250);
        setTimeout(() => {
            try { audio.pause(); } catch (e) { }
            isPlaying = false;
            currentKey = null;
            updateUI();
        }, 260);
    }

    function updateUI() {
        tracks.forEach(t => {
            const key = t.dataset.key;
            const action = t.querySelector('.track-action');
            if (key === currentKey && isPlaying) {
                t.setAttribute('aria-pressed', 'true');
                action.textContent = '⏸';
            } else {
                t.setAttribute('aria-pressed', 'false');
                action.textContent = '▶';
            }
        });
    }

    // Funções para abrir e fechar o modal/menu de músicas
    function openMenu() {
        menu.classList.add('open');
        menu.setAttribute('aria-hidden', 'false');
    }
    function closeMenu() {
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
    }

    // Evento para abrir/fechar o menu ao clicar no ícone de música
    toggle.addEventListener('click', (e) => {
        if (menu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    closeBtn.addEventListener('click', closeMenu);

    // Eventos para os botões de cada música
    tracks.forEach(btn => {
        btn.addEventListener('click', () => {
            const src = btn.dataset.src;
            const key = btn.dataset.key;
            // Se a música clicada já está tocando, pausa ela
            if (currentKey === key && isPlaying) {
                // Pausa
                audio.pause();
                isPlaying = false;
                updateUI();
            } else if (currentKey === key && !isPlaying) { // Se está pausada, continua a tocar
                // resume
                audio.play().then(() => {
                    isPlaying = true;
                    fadeTo(parseFloat(vol.value), 240);
                    updateUI();
                }).catch(() => { });
            } else {
                playTrack(src, key); // Se for uma nova música, toca ela
            }
        });
    });

    // Controle de volume
    vol.addEventListener('input', (e) => {
        const v = parseFloat(e.target.value);
        audio.volume = v;
    });

    // Botão para parar a música
    stopBtn.addEventListener('click', () => {
        stopMusic();
    });

    // Fecha o menu se o usuário clicar fora dele
    document.addEventListener('click', (e) => {
        if (!menu.classList.contains('open')) return;
        if (e.target.closest('.music-wrapper')) return;
        closeMenu();
    });

    // Tecla "Esc" também fecha o menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Atualiza os ícones de play/pause caso a música seja controlada por outros meios
    audio.addEventListener('pause', () => {
        isPlaying = false;
        updateUI();
    });
    audio.addEventListener('play', () => {
        isPlaying = true;
        updateUI();
    });

    // Acessibilidade: prende o foco do Tab dentro do menu quando ele está aberto
    menu.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusable = menu.querySelectorAll('button, input');
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    // Define o estado inicial dos botões
    updateUI();

})();

//spotligh para mobile 

//Quando usuario estiver usando aparelhos mobile, o nome altera dentro do campo de busca apenas para "Digite para buscar..."
function updateSpotlightPlaceholder() {
    const input = document.getElementById("spotlightInput");

    const isMobile = window.matchMedia("(max-width: 720px)").matches;

    if (isMobile) {
        input.placeholder = "Digite para buscar...";
    } else {
        input.placeholder = "Digite para buscar... (ESC para fechar)";
    }
}

// Executa quando a página carrega
updateSpotlightPlaceholder();

// Atualiza conforme a device que o user ultiliza
window.addEventListener("resize", updateSpotlightPlaceholder);

