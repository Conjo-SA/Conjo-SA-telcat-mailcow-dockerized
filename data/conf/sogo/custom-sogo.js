// --- Teclat: skin Gmail ------------------------------------------------------
// 1) Injeta a folha de estilos custom-gmail.css (montada em
//    WebServerResources/css/ via docker-compose.override.yml) após o tema
//    padrão, para que os overrides tenham precedência.
// 2) Adiciona o rótulo "Escrever" ao botão FAB de composição no módulo Mail,
//    no estilo do botão "Compose" do Gmail (estilizado pelo CSS).
(function () {
    function injectGmailCss() {
        if (document.getElementById("teclat-gmail-css")) return;
        // Deriva a URL base a partir de uma folha de estilos já carregada
        // (ex.: .../WebServerResources/css/theme-default.css).
        var base = null;
        var links = document.querySelectorAll('link[rel="stylesheet"][href*="/WebServerResources/css/"]');
        if (links.length) {
            base = links[0].href.replace(/\/css\/[^\/]*$/, "/css/");
        } else {
            base = "/SOGo.woa/WebServerResources/css/";
        }
        var link = document.createElement("link");
        link.id = "teclat-gmail-css";
        link.rel = "stylesheet";
        link.href = base + "custom-gmail.css";
        document.head.appendChild(link);
    }

    var FAB_LABEL = "Escrever";

    function labelComposeFab(root) {
        // Apenas no módulo Mail (o FAB do calendário mantém só o ícone).
        if (!/\/Mail\b/.test(window.location.pathname + window.location.hash)) return;
        var scope = root && root.querySelectorAll ? root : document;
        var fabs = scope.querySelectorAll("button.md-fab");
        for (var i = 0; i < fabs.length; i++) {
            var fab = fabs[i];
            // Só o botão principal de compor (ícone 'edit'); as mini-ações do
            // speed-dial (open_in_browser/open_in_new) ficam como estão.
            var icon = fab.querySelector("md-icon");
            if (!icon || icon.textContent.trim() !== "edit") continue;
            if (!fab.querySelector(".sg-gmail-fab-label")) {
                var span = document.createElement("span");
                span.className = "sg-gmail-fab-label";
                span.textContent = FAB_LABEL;
                fab.appendChild(span);
                // No modo speed-dial, o gatilho só expande as mini-ações
                // (ocultas pelo CSS). Redireciona o clique para a ação
                // "escrever" (ícone open_in_browser), que abre a janela de
                // composição ancorada.
                var speedDial = fab.closest("md-fab-speed-dial");
                if (speedDial) {
                    fab.addEventListener("click", function (ev) {
                        var actions = speedDial.querySelectorAll("md-fab-actions .md-fab md-icon, md-fab-actions button md-icon");
                        for (var k = 0; k < actions.length; k++) {
                            if (actions[k].textContent.trim() === "open_in_browser") {
                                ev.stopPropagation();
                                actions[k].closest("button, .md-button").click();
                                break;
                            }
                        }
                    }, true);
                }
            }
        }
    }

    // Janela de composição estilo Gmail: reorganiza o md-dialog para o layout
    // do compose do Gmail. Mover nós no DOM preserva os bindings do AngularJS
    // (ng-click/ng-disabled/ng-model).
    function gmailifyComposer() {
        var dialogs = document.querySelectorAll("md-dialog.sg-mail-editor");
        for (var i = 0; i < dialogs.length; i++) {
            var dialog = dialogs[i];
            if (dialog.classList.contains("sg-gmailified")) continue;
            var actions = dialog.querySelector("md-dialog-actions.sg-mail-editor-attachments");
            var toolbarTools = dialog.querySelector("md-toolbar .md-toolbar-tools");
            var headerContent = dialog.querySelector("header .msg-header-content");
            if (!actions || !toolbarTools || !headerContent) continue;

            // 1) Título "Nova mensagem" no início do cabeçalho
            var title = document.createElement("span");
            title.className = "sg-gmail-compose-title";
            title.textContent = "Nova mensagem";
            toolbarTools.insertBefore(title, toolbarTools.firstChild);

            // 2) Campo "De" sai da toolbar e vira a primeira linha do corpo
            var fromField = toolbarTools.querySelector("md-autocomplete");
            if (fromField) {
                var fromRow = document.createElement("div");
                fromRow.className = "sg-gmail-from-row";
                var fromLabel = document.createElement("span");
                fromLabel.className = "sg-gmail-from-label";
                fromLabel.textContent = "De";
                fromRow.appendChild(fromLabel);
                fromRow.appendChild(fromField);
                headerContent.insertBefore(fromRow, headerContent.firstChild);
            }

            // 3) Botão enviar sai da toolbar e vira pill azul "Enviar" no
            //    rodapé. Salvar/fechar/fullscreen permanecem na toolbar.
            var buttons = toolbarTools.querySelectorAll("button, .md-button");
            for (var j = 0; j < buttons.length; j++) {
                var icon = buttons[j].querySelector("md-icon");
                if (!icon) continue;
                if (icon.textContent.trim() === "send") {
                    buttons[j].classList.add("sg-gmail-send-btn");
                    var label = document.createElement("span");
                    label.className = "sg-gmail-send-label";
                    label.textContent = "Enviar";
                    buttons[j].appendChild(label);
                    actions.insertBefore(buttons[j], actions.firstChild);
                    break;
                }
            }

            dialog.classList.add("sg-gmailified");
        }
    }

    function start() {
        injectGmailCss();
        labelComposeFab(document);
        gmailifyComposer();
        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    if (added[j].nodeType === 1) {
                        labelComposeFab(added[j]);
                    }
                }
            }
            gmailifyComposer();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
// -----------------------------------------------------------------------------

// --- Teclat Meet: rename the "online meeting" button label ------------------
// SOGo renders the videoconference button with the "Create Jitsi Meeting"
// label (translated e.g. to "Criar Reunião no Jitsi"). We relabel it to match
// the Teclat Meet branding. Placed first so a failure elsewhere in this file
// (e.g. CKEDITOR being undefined on calendar pages) cannot prevent it.
(function () {
    var NEW_LABEL = "Criar Reunião no Meet TeclaT";

    function relabelJitsiButtons(root) {
        var scope = root && root.querySelectorAll ? root : document;
        var labels = scope.querySelectorAll("label.button-label, .button-label");
        for (var i = 0; i < labels.length; i++) {
            var el = labels[i];
            var text = (el.textContent || "").trim();
            if (/jitsi/i.test(text) && el.textContent !== NEW_LABEL) {
                el.textContent = NEW_LABEL;
            }
        }
    }

    function start() {
        relabelJitsiButtons(document);
        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    if (added[j].nodeType === 1) {
                        relabelJitsiButtons(added[j]);
                    }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
// -----------------------------------------------------------------------------

// redirect to mailcow login form
document.addEventListener('DOMContentLoaded', function () {
    var loginForm = document.forms.namedItem("loginForm");
    if (loginForm) {
        window.location.href = '/user';
    }
});
// logout function
function mc_logout() {
    fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "logout=1"
    }).then(() => window.location.href = '/');
}

// Custom SOGo JS

// Change the visible font-size in the editor, this does not change the font of a html message by default
// Guarded: CKEDITOR is not defined on all SOGo pages (e.g. Calendar module),
// and an unguarded call would abort this whole script there.
if (typeof CKEDITOR !== "undefined") {
    CKEDITOR.addCss("body {font-size: 16px !important}");

    // Enable scayt by default
    //CKEDITOR.config.scayt_autoStartup = true;
}

// --- Teclat: Auto-Refresh Mail (Estilo Push/Gmail) ---
// O SOGo Web nativamente não utiliza WebSockets (Push) para atualizar a caixa
// de entrada em tempo real de forma instantânea como o Gmail. Para simular
// esse comportamento de forma transparente, este script clica no botão "Refresh" 
// a cada 30 segundos de forma invisível ao usuário.
// IMPORTANTE: Este clique simula a ação nativa do Angular do SOGo (AJAX).
// Ele atualizará APENAS a lista de e-mails, sem recarregar a página (F5).
// Assim, se o usuário estiver escrevendo um e-mail (Compose), ele NÃO perderá
// o que está digitando.
(function() {
    var REFRESH_INTERVAL = 60000; // 1 minuto (ajuste conforme necessário)

    function autoRefreshMail() {
        // Executa apenas no módulo de Mail (ignorando Calendário, Contatos, etc)
        if (!/\/Mail\b/.test(window.location.pathname + window.location.hash)) return;

        // Localiza o botão de Refresh pelo ícone 'refresh' no Material Design
        var buttons = document.querySelectorAll('button');
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var icon = btn.querySelector('md-icon');
            if (icon && icon.textContent.trim() === 'refresh') {
                // Clica no botão apenas se ele não estiver desabilitado
                if (!btn.disabled && !btn.classList.contains('ng-hide')) {
                    btn.click();
                }
                break;
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            setInterval(autoRefreshMail, REFRESH_INTERVAL);
        });
    } else {
        setInterval(autoRefreshMail, REFRESH_INTERVAL);
    }
})();
// -----------------------------------------------------------------------------
