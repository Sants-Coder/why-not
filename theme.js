// Envolve todo o script em uma IIFE (Immediately Invoked Function Expression)
// para criar um escopo privado e evitar poluir o escopo global.
(function () {
    // Chave usada para armazenar o tema no localStorage do navegador.
    const THEME_KEY = 'whynot_theme';
    // Referência ao elemento raiz <html> para manipulação do atributo de tema.
    const root = document.documentElement;
    // Referência ao botão de alternância de tema.
    const toggle = document.getElementById('themeToggle');

    /**
     * Aplica o tema visual (claro ou escuro) ao site.
     * @param {string} theme - O nome do tema a ser aplicado ('light' or 'dark').
     */
    function applyTheme(theme) {
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
            if (toggle) toggle.checked = true;
        } else {
            root.removeAttribute('data-theme');
            if (toggle) toggle.checked = false;
        }
        // Salva a preferência de tema no localStorage para persistência entre as visitas.
        localStorage.setItem(THEME_KEY, theme);
    }

    /**
     * Inicializa o tema na primeira vez que a página é carregada.
     * A função verifica se há um tema salvo no localStorage. Se não houver,
     * ela detecta a preferência de tema do sistema operacional do usuário.
     */
    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        // Verifica se o usuário prefere o esquema de cores claro no nível do sistema operacional.
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        // Define o tema com base na preferência salva, ou na preferência do sistema, ou 'dark' como padrão.
        const theme = saved || (prefersLight ? 'light' : 'dark');
        applyTheme(theme);
    }

    // Adiciona um ouvinte de evento ao botão de alternância, se ele existir.
    if (toggle) {
        toggle.addEventListener('change', () => {
            // Aplica o tema correspondente ao estado do botão (marcado/desmarcado).
            applyTheme(toggle.checked ? 'light' : 'dark');
        });
    }

    /**
     * Integra os comandos de troca de tema com a funcionalidade de busca "spotlight".
     * Ele carrega os dados do spotlight de 'data.json' se ainda não estiverem disponíveis
     * e adiciona as opções para ativar os temas claro e escuro.
     */
    async function integrateWithSpotlight() {
        if (typeof spotlightData === 'undefined' || !Array.isArray(spotlightData)) {
            try {
                const res = await fetch('data.json');
                window.spotlightData = await res.json();
            } catch (e) {
                window.spotlightData = [];
            }
        }

        // Define os comandos específicos para alterar o tema através do spotlight.
        const themeCommands = [
            {
                label: 'Ativar tema claro — Cinza Aço Premium',
                keywords: 'tema claro light cinza aço tema',
                target: null,
                __themeCmd: 'light'
            },
            {
                label: 'Ativar tema escuro',
                keywords: 'tema escuro dark',
                target: null,
                __themeCmd: 'dark'
            }
        ];

        // Verifica se os comandos de tema já foram adicionados aos dados do spotlight para evitar duplicatas.
        const hasTheme = (window.spotlightData || []).some(i => i.__themeCmd);
        if (!hasTheme) {
            // Adiciona os comandos de tema no início da lista de dados do spotlight.
            window.spotlightData = [...themeCommands, ...(window.spotlightData || [])];
        }
    }

    /**
     * Observa cliques nos resultados da busca "spotlight".
     * Utiliza a delegação de eventos para capturar cliques em itens da lista de resultados.
     * Se um item clicado for um comando de tema, ele aplica o tema correspondente.
     */
    function watchSpotlightClicks() {
        document.addEventListener('click', (e) => {
            const li = e.target.closest && e.target.closest('#spotlightResults li');
            if (!li) return;
            const index = li.dataset.index;
            const label = li.textContent && li.textContent.trim();
            if (!label) return;

            // Encontra o item de dados correspondente ao item da lista clicado.
            const match = (window.spotlightData || []).find(item => item.label === label);

            // Se o item for um comando de tema (identificado pela propriedade '__themeCmd').
            if (match && match.__themeCmd) {
                e.preventDefault(); // Previne a ação padrão do clique.
                applyTheme(match.__themeCmd);
                // Fecha a janela do spotlight, se a função estiver disponível.
                if (typeof closeSpotlight === 'function') closeSpotlight();
            }
        });
    }

    // Executa as funções de inicialização.
    initTheme();
    integrateWithSpotlight();
    watchSpotlightClicks();

    // Expõe a função `applyTheme` globalmente para que possa ser chamada por outros scripts.
    window.applyWhyNotTheme = applyTheme;
})();
