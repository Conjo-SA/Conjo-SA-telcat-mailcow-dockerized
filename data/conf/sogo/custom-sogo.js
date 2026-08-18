// --- Teclat Premium Theme ---------------------------------------------------
(function () {
  function injectCss() {
    if (document.getElementById("teclat-premium-css")) return;
    var base = "/SOGo.woa/WebServerResources/css/";
    var links = document.querySelectorAll(
      'link[rel="stylesheet"][href*="/WebServerResources/css/"]',
    );
    if (links.length) {
      base = links[0].href.replace(/\/css\/[^\/]*$/, "/css/");
    }
    var link = document.createElement("link");
    link.id = "teclat-premium-css";
    link.rel = "stylesheet";
    link.href = base + "teclat-premium.css?v=" + new Date().getTime();
    document.head.appendChild(link);
  }

  function customizeSidebar(root) {
    var scope = root && root.querySelectorAll ? root : document;

    // 1. Adicionar o logo no topo da sidebar
    var sidenavContent = scope.querySelector(
      "md-sidenav.md-sidenav-left md-content",
    );
    if (sidenavContent && !document.getElementById("tcl-sidebar-logo")) {
      var logoDiv = document.createElement("div");
      logoDiv.id = "tcl-sidebar-logo";
      logoDiv.className = "tcl-logo-container";
      logoDiv.innerHTML = '<img src="/SOGo.woa/WebServerResources/assets/logo.svg" alt="Teclat">';
      sidenavContent.insertBefore(logoDiv, sidenavContent.firstChild);
    }

    // 2. Criar botão "Escrever/Criar" customizado e esconder o original (para manter eventos AngularJS intactos)
    var pathUrl = window.location.pathname + window.location.hash;
    var isMail = /\/Mail\b/.test(pathUrl);
    var isCalendar = /\/Calendar\b/.test(pathUrl);

    if (isMail || isCalendar) {
      var mainSidebar = document.querySelector("md-sidenav.md-sidenav-left md-content");
      var logoElement = document.getElementById("tcl-sidebar-logo");
      
      if (mainSidebar && logoElement && !document.getElementById("tcl-fake-compose")) {
        var fakeBtn = document.createElement("button");
        fakeBtn.id = "tcl-fake-compose";
        fakeBtn.className = "tcl-fake-compose-btn";
        
        var iconName = isMail ? "edit" : "add";
        var labelText = isMail ? "Escrever" : "Criar";
        
        fakeBtn.innerHTML = '<md-icon class="material-icons" style="margin-right: 8px;">' + iconName + '</md-icon><span class="sg-fab-label">' + labelText + '</span>';
        
        fakeBtn.addEventListener("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          if (isMail) {
            // Busca O BOTÃO EXATO que o usuário quer disparar no Mail
            var composeBtn = document.querySelector('button[ng-click="mailbox.newMessage($event)"]');
            
            if (composeBtn && window.angular) {
              var scope = angular.element(composeBtn).scope();
              if (scope && scope.mailbox && typeof scope.mailbox.newMessage === 'function') {
                 scope.$apply(function() {
                     scope.mailbox.newMessage(e);
                 });
                 return;
              }
            }
            if (composeBtn) { composeBtn.click(); return; }
            window.location.hash = "/Mail/0/folder/INBOX/new";
          } else if (isCalendar) {
            // No Calendário, abre o menu customizado para escolher entre Evento e Tarefa
            var popup = document.getElementById('tcl-calendar-popup');
            var btnRef = document.getElementById('tcl-fake-compose');
            if (popup && btnRef) {
                var rect = btnRef.getBoundingClientRect();
                popup.style.top = rect.top + 'px';
                popup.style.left = (rect.right + 16) + 'px';
                popup.style.width = '200px'; // Largura fixa bonita para caber o texto
                popup.classList.toggle('show');
            }
          }
        });
        
        mainSidebar.insertBefore(fakeBtn, logoElement.nextSibling);

        // Se for calendário, cria o popup colado no botão (inserido no body para z-index não quebrar)
        if (isCalendar && !document.getElementById('tcl-calendar-popup')) {
            var calPopup = document.createElement('div');
            calPopup.id = 'tcl-calendar-popup';
            calPopup.className = 'tcl-calendar-popup'; // Classe única para não dar conflito
            calPopup.innerHTML = `
              <div class="tcl-calendar-popup-item" onclick="var btn = document.querySelector('button[ng-click=&quot;list.newComponent($event, \\'appointment\\')&quot;]'); if(btn) { btn.click(); } document.getElementById('tcl-calendar-popup').classList.remove('show');">
                <md-icon class="material-icons">event</md-icon>
                <span>Novo Evento</span>
              </div>
              <div class="tcl-calendar-popup-item" onclick="var btn = document.querySelector('button[ng-click=&quot;list.newComponent($event, \\'task\\')&quot;]'); if(btn) { btn.click(); } document.getElementById('tcl-calendar-popup').classList.remove('show');">
                <md-icon class="material-icons">check_box</md-icon>
                <span>Nova Tarefa</span>
              </div>
            `;
            // Insere no body para não ficar preso no overflow/z-index da sidebar
            document.body.appendChild(calPopup);
            
            // Fechar ao clicar fora
            document.addEventListener('click', function(evt) {
                if (!evt.target.closest('#tcl-fake-compose') && !evt.target.closest('#tcl-calendar-popup')) {
                    calPopup.classList.remove('show');
                }
            });
        }
      }
      
      // Esconder os botões flutuantes originais
      var fabs = document.querySelectorAll("button.md-fab, md-fab-speed-dial");
      for (var i = 0; i < fabs.length; i++) {
        // No Mail queremos esconder o fab de "edit". No Calendar o md-fab-speed-dial inteiro
        if (isMail && fabs[i].tagName.toLowerCase() !== "md-fab-speed-dial") {
          var icon = fabs[i].querySelector("md-icon");
          if (icon && icon.textContent.trim() === "edit") {
            fabs[i].style.display = "none";
          }
        } else if (isCalendar && fabs[i].tagName.toLowerCase() === "md-fab-speed-dial") {
          fabs[i].style.display = "none"; // Oculta o FAB nativo novamente
        }
      }
    }

    // 3. Adicionar classes aos itens da sidebar para aplicar SVGs via CSS Mask
    var listItems = scope.querySelectorAll("md-list-item, .md-button");
    for (var k = 0; k < listItems.length; k++) {
      var item = listItems[k];
      
      var text = item.textContent.trim().toLowerCase();
      
      if (text.includes("entrada")) item.classList.add("tcl-item-entrada");
      else if (text.includes("rascunho")) item.classList.add("tcl-item-rascunho");
      else if (text.includes("enviado")) item.classList.add("tcl-item-enviado");
      else if (text.includes("lixeira")) item.classList.add("tcl-item-lixeira");
      else if (text.includes("arquivado") || text.includes("archive")) item.classList.add("tcl-item-arquivado");
      else if (text.includes("modelo")) item.classList.add("tcl-item-modelo");
      else if (text.includes("lixo eletrônico") || text.includes("spam")) item.classList.add("tcl-item-lixo");
      else if (text === "menu" || text.includes("aplicativos")) item.classList.add("tcl-item-menu");
      else if (text.includes("configuraç")) item.classList.add("tcl-item-config");
      else if (text.includes("sair")) item.classList.add("tcl-item-sair");
      
      // Identifica o header de conta (email sem avatar) e esconde
      if (text.includes("@") && !item.querySelector(".md-avatar") && !item.querySelector("sg-avatar") && !item.classList.contains("tcl-item-user")) {
        item.classList.add("tcl-hide-account");
      }
      
      // Identifica o bloco do usuário pela presença de um avatar
      if (item.querySelector(".md-avatar") || item.querySelector("sg-avatar")) {
        item.classList.add("tcl-item-user");
      }
    }
    
    // Injeta o Rodapé Customizado (Menu, Config, Sair, Perfil) se não existir
    var sidenavContent = document.querySelector("md-sidenav.md-sidenav-left md-content");
    if (sidenavContent && !document.getElementById("tcl-custom-footer")) {
      // Captura o nome/email do SOGo de forma robusta
      var userName = "Usuário";
      var userEmail = "";
      
      // 1. Tentar pegar da URL (Mais garantido e rápido em qualquer tela)
      var pathParts = window.location.pathname.split('/');
      var soIndex = pathParts.indexOf('so');
      if (soIndex !== -1 && pathParts.length > soIndex + 1) {
          userEmail = decodeURIComponent(pathParts[soIndex + 1]);
          userName = userEmail.split('@')[0];
      }
      
      // 2. Fallback Angular
      if (!userEmail || userName === "Usuário") {
        try {
          var rootScope = window.angular ? angular.element(document.body).scope() : null;
          if (rootScope && rootScope.app && rootScope.app.user) {
            userEmail = rootScope.app.user.login || userEmail;
            userName = rootScope.app.user.name || userName;
          }
        } catch(e) {}
      }
      
      // 3. Fallback para DOM
      if (!userEmail) {
        var accountNode = document.querySelector(".tcl-hide-account .sg-no-wrap") || document.querySelector("[ng-bind='::account.name']") || document.querySelector("[ng-bind='::app.user.login']");
        if (accountNode) userEmail = accountNode.textContent.trim();
      }
      if (userName === "Usuário" || userName === userEmail.split('@')[0]) {
        var nameNode = document.querySelector(".md-toolbar-tools span[ng-bind='app.user.name']") || document.querySelector("[ng-bind='::app.user.name']");
        if (nameNode) userName = nameNode.textContent.trim();
        else if (userEmail) userName = userEmail.split('@')[0];
      }

      var footer = document.createElement("div");
      footer.id = "tcl-custom-footer";
      footer.className = "tcl-custom-footer";
      
      if (!window.toggleTeclatDarkMode) {
        window.toggleTeclatDarkMode = function() {
          var isDark = document.body.classList.toggle('tcl-dark-mode');
          localStorage.setItem('tcl-dark-mode', isDark ? '1' : '0');
          var icon = document.getElementById('tcl-darkmode-icon');
          var text = document.getElementById('tcl-darkmode-text');
          if (isDark) {
            if (icon) icon.textContent = 'light_mode';
            if (text) text.textContent = 'Modo Claro';
          } else {
            if (icon) icon.textContent = 'dark_mode';
            if (text) text.textContent = 'Modo Escuro';
          }
        };
      }
      
      if (localStorage.getItem('tcl-dark-mode') === '1') {
        document.body.classList.add('tcl-dark-mode');
      }

      var avatarSrc = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userName) + "&background=00cfb0&color=fff";
      var isMailPage = (window.location.pathname + window.location.hash).indexOf('/Mail') !== -1;
      
      var popupHtml = isMailPage ? `
          <!-- Popup do Usuário -->
          <div class="tcl-user-popup" id="tcl-user-popup">
            <div class="tcl-user-popup-item" onclick="var btn = document.querySelector('button[ng-click=&quot;app.delegate(account)&quot;]'); if(btn) { btn.click(); } document.getElementById('tcl-user-popup').classList.remove('show');">
              <span>Delegação</span>
            </div>
            <div class="tcl-user-popup-item" onclick="var btn = document.querySelector('button[ng-click=&quot;app.newFolder(account)&quot;]'); if(btn) { btn.click(); } document.getElementById('tcl-user-popup').classList.remove('show');">
              <span>Nova pasta</span>
            </div>
            <div class="tcl-user-popup-item" onclick="var btn = document.querySelector('button[ng-click=&quot;app.showCleanMailboxPanel(null, account)&quot;]'); if(btn) { btn.click(); } document.getElementById('tcl-user-popup').classList.remove('show');">
              <span>Limpar caixa de correio</span>
            </div>
            <div class="tcl-user-popup-item" onclick="var btn = document.querySelector('button[ng-click=&quot;app.showAdvancedSearch()&quot;]'); if(btn) { btn.click(); } document.getElementById('tcl-user-popup').classList.remove('show');">
              <span>Procurar</span>
            </div>
          </div>
      ` : '';
      
      var moreIconHtml = isMailPage ? `<md-icon class="material-icons tcl-user-more" onclick="document.getElementById('tcl-user-popup').classList.toggle('show')">more_vert</md-icon>` : '';

      footer.innerHTML = `
        <div class="tcl-footer-menu">
          <!-- Popup do Menu -->
          <div class="tcl-menu-popup" id="tcl-menu-popup">
            <div class="tcl-menu-popup-item" onclick="window.location.href='../Mail'">
              <md-icon class="material-icons">email</md-icon>
              <span>Correio</span>
            </div>
            <div class="tcl-menu-popup-item" onclick="window.location.href='../Calendar'">
              <md-icon class="material-icons">event</md-icon>
              <span>Calendário</span>
            </div>
            <div class="tcl-menu-popup-item" onclick="window.location.href='../Contacts'">
              <md-icon class="material-icons">contacts</md-icon>
              <span>Contatos</span>
            </div>
            <div class="tcl-menu-popup-item" onclick="window.location.href='/user'">
              <md-icon class="material-icons">build</md-icon>
              <span>Preferências</span>
            </div>
          </div>
          
          <div class="tcl-footer-item" onclick="document.getElementById('tcl-menu-popup').classList.toggle('show')">
            <md-icon class="material-icons">apps</md-icon>
            <span>Menu</span>
          </div>
          <div class="tcl-footer-item" onclick="window.toggleTeclatDarkMode()">
            <md-icon class="material-icons" id="tcl-darkmode-icon">` + (document.body.classList.contains('tcl-dark-mode') ? 'light_mode' : 'dark_mode') + `</md-icon>
            <span id="tcl-darkmode-text">` + (document.body.classList.contains('tcl-dark-mode') ? 'Modo Claro' : 'Modo Escuro') + `</span>
          </div>
          <div class="tcl-footer-item" onclick="window.location.href='/SOGo/Preferences'">
            <md-icon class="material-icons">settings</md-icon>
            <span>Configurações</span>
          </div>
          <div class="tcl-footer-item tcl-item-sair" onclick="if(typeof mc_logout === 'function') mc_logout(); else window.location.href='/SOGo/logoff';">
            <md-icon class="material-icons">settings_power</md-icon>
            <span>Sair</span>
          </div>
        </div>
        <div class="tcl-user-block">
          ` + popupHtml + `
          <img class="tcl-user-avatar" src="` + avatarSrc + `" alt="Avatar" />
          <div class="tcl-user-info">
            <div class="tcl-user-name">` + userName + `</div>
            <div class="tcl-user-email">` + userEmail + `</div>
          </div>
          ` + moreIconHtml + `
        </div>
      `;
      
      sidenavContent.appendChild(footer);
    }
  }

  // Nova Função: Transforma os avatares genéricos em iniciais coloridas e ajusta data
  function applyCustomAvatars() {
    document.querySelectorAll('md-list-item.sg-message-list-item:not(.tcl-avatar-applied)').forEach(item => {
      // 1. Avatar
      const nameSpan = item.querySelector('.sg-md-subhead > div > span:not(.sg-label-outline)');
      const avatarContainer = item.querySelector('sg-avatar-image');
      
      if (nameSpan && avatarContainer) {
        const name = nameSpan.textContent.trim();
        const icon = avatarContainer.querySelector('md-icon[aria-label="person"]');
        const img = avatarContainer.querySelector('img');
        
        if (name && icon && img) {
          icon.style.display = 'none';
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&rounded=true&size=40`;
          img.src = avatarUrl;
          img.classList.remove('ng-hide');
          img.style.display = 'block';
          img.style.borderRadius = '50%';
        }
      }
      
      item.classList.add('tcl-avatar-applied');
    });
  }

  // Nova Função: Avatar do Visualizador de E-mail (tamanho maior e mesmas iniciais)
  function applyViewerAvatar(node) {
    const root = node && node.nodeType === 1 ? node : document;
    
    // O cabeçalho fica em md-card-content > .layout-wrap > div:first-child
    root.querySelectorAll('.sg-face md-card-content > .layout-wrap > div:first-child:not(.tcl-viewer-avatar-applied)').forEach(item => {
      // Pega o span que tem o nome do remetente
      const nameSpan = item.querySelector('span[ng-bind-html*="name"]');
      const avatarContainer = item.querySelector('sg-avatar-image');
      
      if (nameSpan && avatarContainer) {
        const name = nameSpan.textContent.trim();
        const icon = avatarContainer.querySelector('md-icon[aria-label="person"]');
        const img = avatarContainer.querySelector('img');
        
        if (name && icon && img) {
          icon.style.display = 'none';
          // Tamanho 58px para o visualizador
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&rounded=true&size=58`;
          img.src = avatarUrl;
          img.classList.remove('ng-hide');
          img.style.display = 'block';
          img.style.borderRadius = '50%';
        }
        
        // REORGANIZAÇÃO DA ESTRUTURA PARA FLEXBOX NATIVO
        const wrapContainer = item.closest('.layout-wrap');
        if (wrapContainer) {
          const msgRecipients = wrapContainer.querySelector('.msg-recipients');
          const senderInfoDiv = avatarContainer.nextElementSibling; // A div com span (Nome) e a (E-mail)
          
          if (msgRecipients && senderInfoDiv) {
            // Move os destinatários ("Para:") pra dentro do bloco do remetente
            senderInfoDiv.appendChild(msgRecipients);
            
            // Transforma o bloco do remetente em flex column para que Nome, De e Para fiquem empilhados
            senderInfoDiv.style.display = 'flex';
            senderInfoDiv.style.flexDirection = 'column';
            senderInfoDiv.style.alignItems = 'flex-start';
            senderInfoDiv.style.justifyContent = 'center';
            senderInfoDiv.style.width = '100%';
            
            // Remove a classe flex-50 para ocupar a largura toda
            item.classList.remove('flex-50');
            item.classList.add('flex-100');
            item.style.maxWidth = '100%';
            
            // Limpa formatações restritivas antigas
            msgRecipients.classList.remove('flex-50');
            msgRecipients.style.padding = '0';
            msgRecipients.style.margin = '4px 0 0 0';
            msgRecipients.style.display = 'flex';
            msgRecipients.style.flexDirection = 'column';
          }
        }
        
        item.classList.add('tcl-viewer-avatar-applied');
      }
    });
  }

  // Nova Função: Cria e sincroniza a Data Principal e as setas dentro do Header do Calendário
  function customizeCalendarHeader(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var cardActions = scope.querySelector('md-card-actions');
    
    if (!cardActions && root.tagName && root.tagName.toLowerCase() === 'md-card-actions') {
        cardActions = root;
    }
    if (!cardActions) cardActions = document.querySelector('md-card-actions');
    
    if (cardActions && !document.querySelector('.tcl-calendar-date-container')) {
        var dateContainer = document.createElement('div');
        dateContainer.className = 'tcl-calendar-date-container';
        
        var todayWrapper = document.createElement('div');
        todayWrapper.className = 'tcl-calendar-date-today-wrapper';
        var customDayNum = document.createElement('p');
        customDayNum.className = 'sg-date-day-num';
        todayWrapper.appendChild(customDayNum);
        
        var textWrapper = document.createElement('div');
        textWrapper.className = 'tcl-calendar-date-text-wrapper';
        var customDateGroup = document.createElement('div');
        customDateGroup.className = 'sg-date-group';
        
        var customWeekday = document.createElement('p'); customWeekday.className = 'sg-day';
        var customMonth = document.createElement('p'); customMonth.className = 'sg-month';
        var customYear = document.createElement('p'); customYear.className = 'sg-year';
        
        customDateGroup.appendChild(customWeekday);
        customDateGroup.appendChild(customMonth);
        customDateGroup.appendChild(customYear);
        textWrapper.appendChild(customDateGroup);
        
        var arrowsContainer = document.createElement('div');
        arrowsContainer.className = 'tcl-calendar-arrows';
        
        var buttons = Array.from(cardActions.querySelectorAll('button'));
        var prevBtn = buttons.find(function(b) {
            var icon = b.querySelector('md-icon');
            return icon && icon.textContent.trim() === 'chevron_left';
        });
        var nextBtn = buttons.find(function(b) {
            var icon = b.querySelector('md-icon');
            return icon && icon.textContent.trim() === 'chevron_right';
        });
        
        if (prevBtn) arrowsContainer.appendChild(prevBtn);
        if (nextBtn) arrowsContainer.appendChild(nextBtn);
        
        textWrapper.appendChild(arrowsContainer);
        
        dateContainer.appendChild(todayWrapper);
        dateContainer.appendChild(textWrapper);
        
        cardActions.insertBefore(dateContainer, cardActions.firstChild);
    }
  }

  // Mantém os textos da data no calendário sempre sincronizados com o original (que está invisível)
  function syncCalendarDate() {
    var cContainer = document.querySelector('.tcl-calendar-date-container');
    if (!cContainer) return;

    var cDayNum = cContainer.querySelector('.sg-date-day-num');
    var cWeekday = cContainer.querySelector('.sg-day');
    var cMonth = cContainer.querySelector('.sg-month');
    var cYear = cContainer.querySelector('.sg-year');

    // A fonte de verdade mais rápida e confiável é a URL (hash), pois o SOGo sempre a atualiza
    var hash = window.location.hash || '';
    var match = hash.match(/\/calendar\/(?:day|week|month|multicolumnday)\/(\d{4})(\d{2})(\d{2})/);
    var d = null;
    
    if (match) {
        var y = parseInt(match[1], 10);
        var m = parseInt(match[2], 10) - 1; // Meses em JS começam em 0
        var day = parseInt(match[3], 10);
        d = new Date(y, m, day);
    } 
    
    // Fallback: se a URL não tiver a data explícita, tenta ler do escopo Angular do datepicker
    if (!d || isNaN(d.getTime())) {
        var datePicker = document.querySelector('md-datepicker[ng-model="calendar.selectedDate"]');
        if (datePicker && window.angular) {
            var scope = angular.element(datePicker).scope();
            if (scope && scope.calendar && scope.calendar.selectedDate) {
                // selectedDate pode estar em unix ou objeto Date
                d = new Date(scope.calendar.selectedDate);
            }
        }
    }
    
    // Se ambos falharem (está recarregando ou escopo vazio), ignora a rodada
    if (!d || isNaN(d.getTime())) return; 

    // Arrays para formatar no padrão em Português sem depender de regionalização do navegador
    var diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    var mesesAno = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    var dayStr = d.getDate().toString();
    var weekdayStr = diasSemana[d.getDay()];
    var monthStr = mesesAno[d.getMonth()];
    var yearStr = d.getFullYear().toString();

    if (cDayNum && cDayNum.textContent !== dayStr) cDayNum.textContent = dayStr;
    if (cWeekday && cWeekday.textContent !== weekdayStr) cWeekday.textContent = weekdayStr;
    if (cMonth && cMonth.textContent !== monthStr) cMonth.textContent = monthStr;
    if (cYear && cYear.textContent !== yearStr) cYear.textContent = yearStr;
  }

  function checkCurrentFolder() {
    if (window.location.hash.indexOf('/Drafts') !== -1) {
      document.body.classList.add('tcl-folder-drafts');
    } else {
      document.body.classList.remove('tcl-folder-drafts');
    }
  }

  function start() {
    injectCss();
    customizeSidebar(document);
    applyCustomAvatars();
    applyViewerAvatar(document);
    customizeCalendarHeader(document);
    checkCurrentFolder();
    
    setInterval(syncCalendarDate, 100);
    
    window.addEventListener("hashchange", checkCurrentFolder);
    var observer = new MutationObserver(function (mutations) {
      checkCurrentFolder(); // Garante verificação constante de rota
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1) {
            customizeSidebar(added[j]);
            applyCustomAvatars();
            applyViewerAvatar(added[j]);
            customizeCalendarHeader(added[j]);
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
// ----------------------------------------------------------------------------

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
document.addEventListener("DOMContentLoaded", function () {
  var loginForm = document.forms.namedItem("loginForm");
  if (loginForm) {
    window.location.href = "/user";
  }
});
// logout function
function mc_logout() {
  fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "logout=1",
  }).then(() => (window.location.href = "/"));
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

// --- Teclat Premium: Forçar abertura de modal na mesma tela para todos os usuários ---
(function forceInlineCompose() {
  // 1. Força a configuração
  var checkInterval = setInterval(function() {
    if (window.angular) {
      var appEl = document.querySelector('[ng-app]') || document.body;
      if (appEl) {
        var scope = angular.element(appEl).scope();
        if (scope && scope.app && scope.app.user && scope.app.user.settings && scope.app.user.settings.Mail) {
          if (scope.app.user.settings.Mail.SOGoMailComposeWindow !== "normal") {
             scope.app.user.settings.Mail.SOGoMailComposeWindow = "normal";
          }
        }
      }
    }
  }, 1000);

  // 2. Garante que o Angular abra o md-dialog corretamente (intercepta o click falso)
  document.addEventListener('click', function(e) {
    if (e.target.closest('#tcl-fake-compose')) {
      var isMail = /\/Mail\b/.test(window.location.pathname + window.location.hash);
      if (!isMail) return; // Permite que a lógica do calendário processe o clique
      
      e.preventDefault();
      e.stopPropagation();
      var appEl = document.querySelector('[ng-app]') || document.body;
      var scope = angular.element(appEl).scope();
      // O método newMessage no SOGo geralmente está no escopo do mailbox
      var mailboxEl = document.querySelector('md-content[ui-view="content"]');
      if (mailboxEl) {
         var mbScope = angular.element(mailboxEl).scope();
         if (mbScope && mbScope.mailbox && typeof mbScope.mailbox.newMessage === 'function') {
             mbScope.mailbox.newMessage(e);
             return;
         }
      }
      
      // Fallback: se não achar o método direto, procura o botão original
      var fabs = document.querySelectorAll("button.md-fab, a.md-fab");
      for (var i = 0; i < fabs.length; i++) {
        var icon = fabs[i].querySelector("md-icon");
        if (icon && icon.textContent.trim() === "edit") {
          // Remove target=_blank para forçar abrir na mesma janela se for link
          if (fabs[i].tagName.toLowerCase() === 'a') {
             fabs[i].removeAttribute('target');
             // Se for href para /new, talvez seja melhor não usar o fallback, mas vamos tentar
          }
          fabs[i].click();
          break;
        }
      }
    }
  }, true);

  function setupEventModal(dialog) {
    var attempt = 0;
    var interval = setInterval(function() {
      var eventForm = dialog.querySelector('form[name="eventForm"]');
      if (eventForm) {
        clearInterval(interval);
        
        // 1. Rename title label to "Título do evento"
        var toolbar = dialog.querySelector('md-toolbar');
        if (toolbar) {
          var titleLabel = toolbar.querySelector('md-input-container > label');
          if (titleLabel && titleLabel.textContent.includes('Título')) {
            titleLabel.textContent = 'Título do evento';
          }
        }
        
        // 2. Setup dates and time pickers (De / Para toggle)
        var section2 = dialog.querySelector('.sg-form-section:nth-of-type(2)');
        if (section2) {
          setupEventModalDates(section2);
        }
        
        // 3. Rename Jitsi/Meet buttons if present
        var section1 = dialog.querySelector('.sg-form-section:nth-of-type(1)');
        if (section1) {
          var labels = section1.querySelectorAll('.button-label, label.button-label');
          labels.forEach(function(el) {
            var text = el.textContent.trim();
            if (/jitsi|meet/i.test(text)) {
              el.textContent = 'Reunião no Meet';
            }
          });
        }
      }
      attempt++;
      if (attempt > 50) {
        clearInterval(interval);
      }
    }, 100);
  }

  function setupEventModalDates(section2) {
    var dateRow = section2.querySelector('div.layout-row:nth-of-type(2)');
    if (!dateRow) return;
    var deCol = dateRow.children[0];
    var paraCol = dateRow.children[1];
    if (!deCol || !paraCol) return;

    var deDateInput = deCol.querySelector('md-datepicker input');
    var deTimeInput = deCol.querySelector('sg-timepicker input');
    var paraDateInput = paraCol.querySelector('md-datepicker input');
    var paraTimeInput = paraCol.querySelector('sg-timepicker input');
    
    // Relabel checkboxes to match mockup exactly
    var allDayCheckbox = section2.querySelector('md-checkbox[ng-model="event.isAllDay"]');
    if (allDayCheckbox) {
      var labelSpan = allDayCheckbox.querySelector('.md-label');
      if (labelSpan && labelSpan.textContent.trim() === 'Dia todo') {
        labelSpan.textContent = 'Evento o dia todo';
      }
    }
    var isFreeCheckbox = section2.querySelector('md-checkbox[ng-model="event.isFree"]');
    if (isFreeCheckbox) {
      var labelSpan = isFreeCheckbox.querySelector('.md-label');
      if (labelSpan && (labelSpan.textContent.trim() === 'Mostrar como livre' || labelSpan.textContent.trim() === 'Exibir como livre')) {
        labelSpan.textContent = 'Exibir hora como livre';
      }
    }

    var shouldHide = true;
    if (deDateInput && paraDateInput && deDateInput.value !== paraDateInput.value) {
      shouldHide = false; // Multi-day event, keep end date visible!
    }
    
    if (shouldHide) {
      paraCol.classList.add('tcl-para-hidden');
    }

    var toggleBtn = section2.querySelector('.tcl-toggle-vencimento');
    if (!toggleBtn) {
      toggleBtn = document.createElement('a');
      toggleBtn.className = 'tcl-toggle-vencimento';
      toggleBtn.href = '#';
      
      if (paraCol.classList.contains('tcl-para-hidden')) {
        toggleBtn.textContent = 'Adicionar vencimento';
      } else {
        toggleBtn.textContent = 'Remover vencimento';
      }
      
      toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (paraCol.classList.contains('tcl-para-hidden')) {
          paraCol.classList.remove('tcl-para-hidden');
          toggleBtn.textContent = 'Remover vencimento';
        } else {
          paraCol.classList.add('tcl-para-hidden');
          toggleBtn.textContent = 'Adicionar vencimento';
          if (deDateInput && paraDateInput) {
            paraDateInput.value = deDateInput.value;
            paraDateInput.dispatchEvent(new Event('input'));
            paraDateInput.dispatchEvent(new Event('change'));
          }
        }
      });
      
      deCol.appendChild(toggleBtn);
    }
  }

  // 3. Observa a criação do md-dialog e injeta uma classe CSS para podermos estilizar
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && node.tagName.toLowerCase() === 'md-dialog') {
          // Se o dialog tem o form messageForm ou o dialogContent_mailEditor
          if (node.querySelector('form[name="messageForm"]') || node.querySelector('#dialogContent_mailEditor')) {
            node.classList.add('tcl-mail-modal');
            node.classList.remove('md-dialog-fullscreen'); // Remove fullscreen nativo do angular
          } else if (node.querySelector('form[name="eventForm"]')) {
            node.classList.add('tcl-event-modal');
            node.classList.remove('md-dialog-fullscreen');
            setupEventModal(node);
          }
        } else if (node.nodeType === 1 && node.querySelector && node.querySelector('md-dialog')) {
          var dialogs = node.querySelectorAll('md-dialog');
          dialogs.forEach(function(dialog) {
            if (dialog.querySelector('form[name="messageForm"]') || dialog.querySelector('#dialogContent_mailEditor')) {
              dialog.classList.add('tcl-mail-modal');
              dialog.classList.remove('md-dialog-fullscreen');
            } else if (dialog.querySelector('form[name="eventForm"]')) {
              dialog.classList.add('tcl-event-modal');
              dialog.classList.remove('md-dialog-fullscreen');
              setupEventModal(dialog);
            }
          });
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
// -----------------------------------------------------------------------------------

