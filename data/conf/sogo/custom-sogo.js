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
    
    link.onload = function() {
      setTimeout(function() {
        window.dispatchEvent(new Event("resize"));
        try {
          var container = document.querySelector('md-virtual-repeat-container');
          if (container && window.angular) {
             var scope = window.angular.element(container).scope();
             if (scope) scope.$broadcast('$md-resize');
          }
        } catch(e) {}
      }, 400);
    };
    
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
    var isContacts = /\/Contacts\b/.test(pathUrl);

    if (isMail || isCalendar || isContacts) {
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
            // Procura o botão nativo do SOGo (por atributo ng-click)
            var composeBtn = document.querySelector('[ng-click^="mailbox.newMessage"]');
            
            // Se não encontrar, procura dentro das ações do speed-dial
            if (!composeBtn) {
                var actions = document.querySelectorAll('md-fab-actions button');
                for (var i = 0; i < actions.length; i++) {
                    var icon = actions[i].querySelector('md-icon');
                    if (icon && (icon.textContent.trim() === 'edit' || icon.textContent.trim() === 'mail')) {
                        composeBtn = actions[i];
                        break;
                    }
                }
            }

            if (composeBtn) {
                var clickEvt = new MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: false, view: window });
                composeBtn.dispatchEvent(clickEvt);
                return;
            }
            // Fallback alterando o hash (pode não funcionar se já estiver no mesmo hash)
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
          } else if (isContacts) {
            // Em Contatos, abre o menu customizado para escolher entre Contato e Lista
            var contactPopup = document.getElementById('tcl-contacts-popup');
            var btnRef = document.getElementById('tcl-fake-compose');
            if (contactPopup && btnRef) {
                var rect = btnRef.getBoundingClientRect();
                contactPopup.style.top = rect.top + 'px';
                contactPopup.style.left = (rect.right + 16) + 'px';
                contactPopup.style.width = '200px'; 
                contactPopup.classList.toggle('show');
            }
          }
        });
        
        mainSidebar.insertBefore(fakeBtn, logoElement.nextSibling);

        // Função universal extremamente agressiva para forçar clique em botões do Angular Material
        if (!window.forceSogoClick) {
            window.forceSogoClick = function(actionType) {
                var btn = null;
                // Busca o botão exato de criar cartão ou lista vasculhando todo o DOM
                if (actionType === 'card') {
                    btn = document.querySelector('[ng-click*="newCard"], [ui-sref*="newCard"], md-fab-actions button:nth-child(1)');
                } else if (actionType === 'list') {
                    btn = document.querySelector('[ng-click*="newList"], [ui-sref*="newList"], md-fab-actions button:nth-child(2)');
                }

                if(btn) {
                    // Verifica se tem link nativo
                    var href = btn.getAttribute('href');
                    if(href && href !== '#' && href !== '') {
                        window.location.href = href;
                        return;
                    }
                    
                    // Aciona o evento no Angular
                    if(window.angular) {
                        angular.element(btn).triggerHandler('click');
                    }
                    
                    btn.removeAttribute('disabled');
                    var evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
                    btn.dispatchEvent(evt);
                    btn.click();
                } else {
                    // Fallback extremo: Invoca o escopo do Angular diretamente
                    if (window.angular) {
                        var scope = angular.element(document.querySelector('md-content')).scope() || angular.element(document.body).scope();
                        if (scope) {
                            // SOGo injeta app no scope
                            if (scope.app) {
                                if (actionType === 'card' && scope.app.newCard) scope.app.newCard();
                                else if (actionType === 'list' && scope.app.newList) scope.app.newList();
                            }
                        }
                    }
                }
            };
        }

        // Se for calendário, cria o popup colado no botão
        if (isCalendar && !document.getElementById('tcl-calendar-popup')) {
            var calPopup = document.createElement('div');
            calPopup.id = 'tcl-calendar-popup';
            calPopup.className = 'tcl-calendar-popup'; 
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
            document.body.appendChild(calPopup);
            
            document.addEventListener('click', function(evt) {
                if (!evt.target.closest('#tcl-fake-compose') && !evt.target.closest('#tcl-calendar-popup')) {
                    calPopup.classList.remove('show');
                }
            });
        }
        
        // Se for contatos, cria o popup colado no botão
        if (isContacts && !document.getElementById('tcl-contacts-popup')) {
            var contPopup = document.createElement('div');
            contPopup.id = 'tcl-contacts-popup';
            contPopup.className = 'tcl-calendar-popup'; 
            contPopup.innerHTML = `
              <div class="tcl-calendar-popup-item" onclick="window.forceSogoClick('card'); document.getElementById('tcl-contacts-popup').classList.remove('show');">
                <md-icon class="material-icons">person_add</md-icon>
                <span>Criar um novo contato</span>
              </div>
              <div class="tcl-calendar-popup-item" onclick="window.forceSogoClick('list'); document.getElementById('tcl-contacts-popup').classList.remove('show');">
                <md-icon class="material-icons">group_add</md-icon>
                <span>Criar uma nova lista</span>
              </div>
            `;
            document.body.appendChild(contPopup);
            
            document.addEventListener('click', function(evt) {
                if (!evt.target.closest('#tcl-fake-compose') && !evt.target.closest('#tcl-contacts-popup')) {
                    contPopup.classList.remove('show');
                }
            });
        }
      }
      
      // Ajuste dos ícones de "adicionar" na sidebar de contatos (trocar add_circle_outline por add)
      if (isContacts && mainSidebar) {
        var addIcons = mainSidebar.querySelectorAll('.sg-md-subheader--with-secondary-icon button md-icon');
        for (var n = 0; n < addIcons.length; n++) {
            if (addIcons[n].textContent.trim() === 'add_circle_outline') {
                addIcons[n].textContent = 'add';
            }
        }
      }
      
      // Esconder os botões flutuantes originais sem removê-los do fluxo de eventos (para o Angular não matar os filhos do Speed Dial)
      var fabs = document.querySelectorAll("button.md-fab, md-fab-speed-dial");
      for (var i = 0; i < fabs.length; i++) {
        if (isMail && fabs[i].tagName.toLowerCase() !== "md-fab-speed-dial") {
          var icon = fabs[i].querySelector("md-icon");
          if (icon && icon.textContent.trim() === "edit") {
            fabs[i].style.opacity = "0";
            fabs[i].style.position = "absolute";
            fabs[i].style.zIndex = "-9999";
            fabs[i].style.pointerEvents = "none";
          }
        } else if ((isCalendar || isContacts) && fabs[i].tagName.toLowerCase() === "md-fab-speed-dial") {
          fabs[i].style.opacity = "0";
          fabs[i].style.position = "absolute";
          fabs[i].style.zIndex = "-9999";
          fabs[i].style.pointerEvents = "none";
        } else if (isContacts && fabs[i].tagName.toLowerCase() === "button") {
          fabs[i].style.opacity = "0";
          fabs[i].style.position = "absolute";
          fabs[i].style.zIndex = "-9999";
          fabs[i].style.pointerEvents = "none";
        }
      }
    }

    // 3. Adicionar classes aos itens da sidebar para aplicar SVGs via CSS Mask
    var sidenavScope = scope.querySelectorAll ? scope : document;
    var listItems = sidenavScope.querySelectorAll("md-sidenav md-list-item, md-sidenav .md-button");
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
    
    // Injeta o Rodapé Customizado (Menu, Config, Sair, Perfil) em todas as sidebars
    var sidenavContents = document.querySelectorAll("md-sidenav.md-sidenav-left md-content");
    sidenavContents.forEach(function(sidenavContent) {
      if (!sidenavContent.querySelector(".tcl-custom-footer")) {
        // Captura o nome/email do SOGo de forma robusta
        var userName = "Usuário";
        var userEmail = "";
        
        // 1. Tentar pegar da URL
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
        footer.className = "tcl-custom-footer";
        
        if (!window.toggleTeclatDarkMode) {
          window.toggleTeclatDarkMode = function() {
            var isDark = document.body.classList.toggle('tcl-dark-mode');
            localStorage.setItem('tcl-dark-mode', isDark ? '1' : '0');
            var icons = document.querySelectorAll('.tcl-darkmode-icon');
            var texts = document.querySelectorAll('.tcl-darkmode-text');
            for (var i = 0; i < icons.length; i++) {
              icons[i].textContent = isDark ? 'wb_sunny' : 'brightness_2';
            }
            for (var j = 0; j < texts.length; j++) {
              texts[j].textContent = isDark ? 'Modo Claro' : 'Modo Escuro';
            }
          };
        }
        
        if (localStorage.getItem('tcl-dark-mode') === '1') {
          document.body.classList.add('tcl-dark-mode');
        }

        var avatarSrc = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userName) + "&background=00cfb0&color=fff";
        var isMailPage = (window.location.pathname + window.location.hash).indexOf('/Mail') !== -1;
        var uniqueId = Math.random().toString(36).substr(2, 9);
        
        var popupHtml = `
            <!-- Popup do Usuário -->
            <div class="tcl-user-popup" id="tcl-user-popup-${uniqueId}">
              <div class="tcl-user-popup-item" onclick="var btn = document.querySelector('button[ng-click=&quot;app.delegate(account)&quot;]'); if(btn) { btn.click(); } document.getElementById('tcl-user-popup-${uniqueId}').classList.remove('show');">
                <span>Delegação</span>
              </div>
              <div class="tcl-user-popup-item" onclick="var btn = document.querySelector('button[ng-click=&quot;app.newFolder(account)&quot;]'); if(btn) { btn.click(); } document.getElementById('tcl-user-popup-${uniqueId}').classList.remove('show');">
                <span>Nova pasta</span>
              </div>
              <div class="tcl-user-popup-item" onclick="var btn = document.querySelector('button[ng-click=&quot;app.showCleanMailboxPanel(null, account)&quot;]'); if(btn) { btn.click(); } document.getElementById('tcl-user-popup-${uniqueId}').classList.remove('show');">
                <span>Limpar caixa de correio</span>
              </div>
              <div class="tcl-user-popup-item" onclick="var btn = document.querySelector('button[ng-click=&quot;app.showAdvancedSearch()&quot;]'); if(btn) { btn.click(); } document.getElementById('tcl-user-popup-${uniqueId}').classList.remove('show');">
                <span>Procurar</span>
              </div>
            </div>
        `;
        
        var moreIconHtml = `<md-icon class="material-icons tcl-user-more" onclick="document.getElementById('tcl-user-popup-${uniqueId}').classList.toggle('show')">more_vert</md-icon>`;

        footer.innerHTML = `
          <div class="tcl-footer-menu">
            <div class="tcl-menu-popup" id="tcl-menu-popup-${uniqueId}">
              <div class="tcl-menu-popup-item" onclick="window.location.href='/SOGo/so/${userEmail}/Mail'">
                <md-icon class="material-icons">email</md-icon>
                <span>Correio</span>
              </div>
              <div class="tcl-menu-popup-item" onclick="window.location.href='/SOGo/so/${userEmail}/Calendar'">
                <md-icon class="material-icons">event</md-icon>
                <span>Calendário</span>
              </div>
              <div class="tcl-menu-popup-item" onclick="window.location.href='/SOGo/so/${userEmail}/Contacts'">
                <md-icon class="material-icons">contacts</md-icon>
                <span>Contatos</span>
              </div>
              <div class="tcl-menu-popup-item" onclick="window.location.href='/SOGo/so/${userEmail}/Preferences#!/general'">
                <md-icon class="material-icons">build</md-icon>
                <span>Preferências</span>
              </div>
            </div>
            
            <div class="tcl-footer-item" onclick="document.getElementById('tcl-menu-popup-${uniqueId}').classList.toggle('show')">
              <md-icon class="material-icons">apps</md-icon>
              <span>Menu</span>
            </div>
            <div class="tcl-footer-item" onclick="window.toggleTeclatDarkMode()">
              <md-icon class="material-icons tcl-darkmode-icon">` + (document.body.classList.contains('tcl-dark-mode') ? 'wb_sunny' : 'brightness_2') + `</md-icon>
              <span class="tcl-darkmode-text">` + (document.body.classList.contains('tcl-dark-mode') ? 'Modo Claro' : 'Modo Escuro') + `</span>
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
    });
  }

  // Inject top header into all mobile views dynamically
  setInterval(function() {
    if (window.innerWidth < 960) {
      // Find the best container to inject the header
      // It can be view-list, view-detail, preferences module, or the main content view itself
      var container = document.querySelector('.view-list') || 
                      document.querySelector('.view-detail') ||
                      document.querySelector('div[ui-view="module"]') ||
                      document.querySelector('md-content[ui-view="content"]');
                      
      if (container && !document.getElementById('tcl-mobile-calendar-header')) {
        var headerHTML = `
          <md-toolbar id="tcl-mobile-calendar-header" class="md-tall _md layout-align-space-between-start layout-row _md-toolbar-transitions" layout-align="space-between start" layout="row" style="flex: none; z-index: 50;">
            <div layout="row" class="md-toolbar-tools sg-toolbar-group-1 layout-row">
              <button class="md-icon-button hide-gt-md md-button md-ink-ripple tcl-item-menu" type="button" aria-label="Alternar Menu" onclick="var btn = document.querySelector('button[ng-click*=\\'toggleLeft()\\']'); if(btn){btn.click();} else { var sn = document.querySelector('md-sidenav'); if(sn) sn.classList.toggle('md-closed'); var bd = document.querySelector('md-backdrop'); if(bd) bd.classList.toggle('ng-hide'); }">
                <md-icon class="material-icons" role="img" aria-hidden="true">menu</md-icon>
              </button>
            </div>
            <div class="md-toolbar-tools sg-toolbar-group-last layout-align-end-center layout-row" layout-align="end center" layout="row">
              <a class="md-icon-button md-button md-ink-ripple" href="Calendar">
                <md-icon class="material-icons">event</md-icon>
              </a>
              <a class="md-icon-button md-button md-ink-ripple" href="Contacts">
                <md-icon class="material-icons">contacts</md-icon>
              </a>
              <a class="md-icon-button md-button md-ink-ripple" href="Mail">
                <md-icon class="material-icons">email</md-icon>
              </a>
              <a class="md-icon-button md-button md-ink-ripple" href="Preferences#!/general">
                <md-icon class="material-icons">build</md-icon>
              </a>
              <a class="md-icon-button md-button md-ink-ripple" href="#" onclick="if(typeof mc_logout==='function'){mc_logout();}else{window.location.href='/SOGo/logoff';}">
                <md-icon class="material-icons">settings_power</md-icon>
              </a>
            </div>
          </md-toolbar>
        `;
        
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = headerHTML;
        container.insertBefore(tempDiv.firstElementChild, container.firstChild);
      }
    } else {
      var header = document.getElementById('tcl-mobile-calendar-header');
      if (header && window.innerWidth >= 960) {
        header.remove();
      }
    }
  }, 500);

  function applyCustomAvatars() {
    // Retiramos o :not(.tcl-avatar-applied) para que o script sempre verifique
    // as linhas recicladas pelo md-virtual-repeat do Angular (ao fazer scroll)
    document.querySelectorAll('md-list-item.sg-message-list-item').forEach(item => {
      const nameSpan = item.querySelector('.sg-md-subhead > div > span:not(.sg-label-outline)');
      const avatarContainer = item.querySelector('sg-avatar-image');
      
      if (nameSpan && avatarContainer) {
        const name = nameSpan.textContent.trim();
        // Alterado para um fundo azul claro (0ea5e9) com duas siglas geradas pela api
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&rounded=true&size=40`;
        
        let tclImg = avatarContainer.querySelector('img.tcl-custom-avatar');
        if (!tclImg) {
          tclImg = document.createElement('img');
          tclImg.className = 'tcl-custom-avatar';
          avatarContainer.appendChild(tclImg);
        }
        
        // Se a reciclagem do Angular mudou o nome da linha, atualizamos a imagem
        if (tclImg.src !== avatarUrl) {
          tclImg.src = avatarUrl;
        }
      }
    });
  }

  // Nova Função: Avatar do Visualizador de E-mail (tamanho maior e mesmas iniciais)
  function applyViewerAvatar(node) {
    const root = node && node.nodeType === 1 ? node : document;
    
    root.querySelectorAll('.sg-face md-card-content > .layout-wrap > div:first-child:not(.tcl-viewer-avatar-applied)').forEach(item => {
      const nameSpan = item.querySelector('span[ng-bind-html*="name"]');
      const avatarContainer = item.querySelector('sg-avatar-image');
      
      if (nameSpan && avatarContainer) {
        const name = nameSpan.textContent.trim();
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&rounded=true&size=58`;
        
        // 1. Criar nossa própria imagem que o Angular não controla
        let tclImg = avatarContainer.querySelector('img.tcl-custom-avatar');
        if (!tclImg) {
          tclImg = document.createElement('img');
          tclImg.className = 'tcl-custom-avatar';
          tclImg.style.borderRadius = '50%';
          tclImg.style.display = 'block';
          tclImg.style.width = '58px';
          tclImg.style.height = '58px';
          avatarContainer.appendChild(tclImg);
        }
        
        if (tclImg.src !== avatarUrl) {
          tclImg.src = avatarUrl;
        }
        
        // REORGANIZAÇÃO DA ESTRUTURA PARA FLEXBOX NATIVO
        const wrapContainer = item.closest('.layout-wrap');
        if (wrapContainer) {
          const msgRecipients = wrapContainer.querySelector('.msg-recipients');
          const senderInfoDiv = avatarContainer.nextElementSibling;
          
          if (msgRecipients && senderInfoDiv) {
            senderInfoDiv.appendChild(msgRecipients);
            senderInfoDiv.style.display = 'flex';
            senderInfoDiv.style.flexDirection = 'column';
            senderInfoDiv.style.alignItems = 'flex-start';
            senderInfoDiv.style.justifyContent = 'center';
            senderInfoDiv.style.width = '100%';
            
            item.classList.remove('flex-50');
            item.classList.add('flex-100');
            item.style.maxWidth = '100%';
            
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

  // Nova Função: Avatar na tela de escrever novo email (compose)
  function applyComposeAvatar(node) {
    const root = node && node.nodeType === 1 ? node : document;
    
    root.querySelectorAll('sg-avatar-image[sg-email="editor.message.editable.from"]').forEach(avatarContainer => {
      let name = "Usuário";
      
      const selectNode = avatarContainer.nextElementSibling;
      let rawText = "";
      let inputNode = null;
      let mdText = null;

      if (selectNode) {
        if (selectNode.tagName === 'MD-SELECT') {
          mdText = selectNode.querySelector('.md-text');
          if (mdText) rawText = mdText.textContent.trim();
        } else if (selectNode.tagName === 'MD-AUTOCOMPLETE') {
          inputNode = selectNode.querySelector('input');
          if (inputNode) rawText = inputNode.value.trim();
        }
      }

      let angularUserName = "";
      let angularUserEmail = "";
      try {
        const rootScope = window.angular ? angular.element(document.body).scope() : null;
        if (rootScope && rootScope.app && rootScope.app.user) {
          angularUserName = rootScope.app.user.name || "";
          angularUserEmail = rootScope.app.user.login || "";
        }
      } catch(e) {}

      if (rawText) {
        let extractedEmail = "";
        if (rawText.includes('<') && rawText.includes('>')) {
           extractedEmail = rawText.split('<')[1].split('>')[0].trim();
        } else if (rawText.includes('@')) {
           extractedEmail = rawText;
        }

        const namePart = rawText.split('<')[0].trim();
        if (namePart === extractedEmail || !namePart) {
           name = angularUserName || angularUserEmail.split('@')[0] || "Usuário";
        } else {
           name = namePart;
        }

        const displayEmail = extractedEmail || angularUserEmail;
        const displayName = name !== "Usuário" ? name : angularUserName;
        if (displayName && displayEmail && displayEmail.includes('@')) {
           const formattedText = displayName + " <" + displayEmail + ">";
           if (mdText && mdText.textContent.trim() !== formattedText) {
               mdText.textContent = formattedText;
           } else if (inputNode && inputNode.value !== formattedText) {
               inputNode.value = formattedText;
           }
        }
      } else {
         name = angularUserName || angularUserEmail.split('@')[0] || "Usuário";
      }
      
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&rounded=true&size=40`;
      
      let tclImg = avatarContainer.querySelector('img.tcl-custom-avatar');
      if (!tclImg) {
        tclImg = document.createElement('img');
        tclImg.className = 'tcl-custom-avatar';
        tclImg.style.borderRadius = '50%';
        tclImg.style.display = 'block';
        tclImg.style.width = '40px';
        tclImg.style.height = '40px';
        
        // Hide default Material icons and native image
        const mdIcons = avatarContainer.querySelectorAll('md-icon');
        mdIcons.forEach(icon => {
           icon.style.display = 'none';
        });
        const nativeImg = avatarContainer.querySelector('img:not(.tcl-custom-avatar)');
        if (nativeImg) {
            nativeImg.style.display = 'none';
        }
        
        avatarContainer.appendChild(tclImg);
      }
      
      if (tclImg.src !== avatarUrl) {
        tclImg.src = avatarUrl;
      }
    });
  }

  // Nova Função: Cria e sincroniza a Data Principal e as setas dentro do Header do Calendário
  function customizeCalendarHeader(root) {
    var isCalendar = /\/Calendar\b/.test(window.location.pathname + window.location.hash);
    if (!isCalendar) return;

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
    applyComposeAvatar(document);
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
            applyComposeAvatar(added[j]);
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
      // Procura o botão nativo do SOGo
      var composeBtn = document.querySelector('[ng-click^="mailbox.newMessage"]');
      if (!composeBtn) {
          var actions = document.querySelectorAll('md-fab-actions button');
          for (var i = 0; i < actions.length; i++) {
              var icon = actions[i].querySelector('md-icon');
              if (icon && (icon.textContent.trim() === 'edit' || icon.textContent.trim() === 'mail')) {
                  composeBtn = actions[i];
                  break;
              }
          }
      }

      if (composeBtn) {
          var clickEvt = new MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: false, view: window });
          composeBtn.dispatchEvent(clickEvt);
      } else {
          window.location.hash = "/Mail/0/folder/INBOX/new";
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
          } else if (node.querySelector('form[name="eventForm"]') || node.querySelector('form[name="taskForm"]') || node.querySelector('md-icon[aria-label="assignment_turned_in"]')) {
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
            } else if (dialog.querySelector('form[name="eventForm"]') || dialog.querySelector('form[name="taskForm"]') || dialog.querySelector('md-icon[aria-label="assignment_turned_in"]')) {
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


// ── Preferências: Injetar títulos de seção e divisores ──────────────────────
(function() {
    function injectPreferencesSections() {
        var form = document.getElementById('generalOptionsView-content');
        if (!form || document.getElementById('tcl-pref-sections-injected')) return;

        var container = form.querySelector('div.flex-100, div[flex="100"]');
        if (!container) return;

        // Marcar como injetado
        var marker = document.createElement('span');
        marker.id = 'tcl-pref-sections-injected';
        marker.style.display = 'none';
        container.appendChild(marker);

        function makeHr() {
            var hr = document.createElement('hr');
            hr.className = 'tcl-pref-hr';
            return hr;
        }

        function makeHeading(text) {
            var h = document.createElement('h3');
            h.className = 'tcl-pref-section-title';
            h.textContent = text;
            return h;
        }

        // Buscar elementos-âncora
        var idiomaRow = container.querySelector('div[layout="row"]:not([layout-align])');
        var modulo = container.querySelector('#select_107, md-select[aria-label*="padrão" i], md-select[aria-label*="implicit" i], md-select[aria-label*="Modul" i], md-select[aria-label*="Módulo" i]');
        var gravatarRow = container.querySelector('div[layout-align="start start"], div[layout="row"][layout-align]');

        if (idiomaRow) {
            container.insertBefore(makeHr(), idiomaRow);
            container.insertBefore(makeHeading('Idioma e Localização'), idiomaRow);
        }

        if (modulo) {
            var moduloContainer = modulo.closest('md-input-container');
            if (moduloContainer) {
                container.insertBefore(makeHr(), moduloContainer);
                container.insertBefore(makeHeading('Preferências'), moduloContainer);
            }
        }

        if (gravatarRow) {
            container.insertBefore(makeHr(), gravatarRow);
            container.insertBefore(makeHeading('Avatar e Aparência'), gravatarRow);
        }
    }

    // Observar quando a tela de preferências carrega
    var prefObserver = new MutationObserver(function(mutations) {
        if (document.getElementById('generalOptionsView-content')) {
            setTimeout(injectPreferencesSections, 300);
        }
    });
    prefObserver.observe(document.body, { childList: true, subtree: true });

    // Tentar na carga inicial também
    setTimeout(injectPreferencesSections, 500);
})();
// ────────────────────────────────────────────────────────────────────────────

// ── Preferências: Botão Salvar em TODAS as abas ──────────────────────────────
(function() {
    function injectUniversalSaveButton() {
        if (window.location.href.indexOf('Preferences') === -1) return;

        // Encontra abas ativas (md-tab-content > div) OU painéis sem aba (md-content direto no module)
        var selectors = [
            'md-tab-content > div[md-tabs-template]', 
            'div[ui-view="module"] > md-content'
        ];
        var targetNodes = document.querySelectorAll(selectors.join(', '));
        
        Array.from(targetNodes).forEach(function(content, index) {
            // Ignorar md-contents que sejam apenas avisos ou cards soltos (ex: hasActiveExternalSieveScripts)
            if (content.tagName.toLowerCase() === 'md-content' && content.classList.contains('ng-hide') && content.querySelector('md-card')) return;
            // Evitar injetar no md-content pai que apenas segura as abas
            if (content.querySelector('md-tabs')) return;

            // Criar ID único para cada container baseado no index ou ID real
            var uniqueId = content.id || ('tab-content-' + index);
            var btnId = 'tcl-pref-save-btn-' + uniqueId;
            
            if (document.getElementById(btnId)) return; // Já injetou nesta aba

            // Para evitar que o footer sobreponha elementos (como os botões "Criar Filtro"), 
            // precisamos injetá-lo DENTRO do painel com rolagem real (md-content ou div.md-padding)
            // Filtramos elementos com ng-include porque o SOGo cria painéis ocultos de Sieve!
            // Filtramos [role="listbox"] para evitar injetar dentro de menus dropdown (md-select-menu)
            var container = content.querySelector('[role="tabpanel"]:not(md-tab-content)') || 
                            content.querySelector('md-content:not([ng-include]):not([role="listbox"])') || 
                            content;

            var innerContainer = container.querySelector('div.layout-column.flex-100') || 
                                 container.querySelector('div[layout="column"][flex="100"]') || 
                                 container;

            // Criar rodapé com o botão
            var footer = document.createElement('div');
            footer.className = 'tcl-pref-footer';

            var btn = document.createElement('button');
            btn.id = btnId;
            btn.className = 'tcl-pref-save-button';
            btn.textContent = 'Salvar alterações';

            // Comportamento do clique
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                var originalBtn = document.querySelector('md-toolbar.md-tall button.md-fab[ng-click*="save"]');
                if (originalBtn && !originalBtn.disabled) {
                    originalBtn.click();
                }
            });

            // Sincronizar estado disabled lendo o escopo do Angular diretamente
            function syncDisabledState() {
                var isDisabled = true;
                
                // Tenta ler o estado oficial do Angular (formulário sujo/alterado)
                // Ignoramos a validação de form.$valid para que o botão fique verde
                // assim que o usuário alterar algo. Se estiver inválido, o SOGo 
                // mostrará as mensagens de erro em vermelho ao tentar salvar.
                try {
                    var formElement = document.querySelector('form[name="preferencesForm"]');
                    var scope = window.angular && formElement ? window.angular.element(formElement).scope() : null;
                    if (scope && scope.preferencesForm) {
                        // Se o formulário tiver alterações ($dirty), habilitamos o botão!
                        isDisabled = !scope.preferencesForm.$dirty;
                    } else {
                        // Fallback para ler a classe do botão original
                        var originalBtn = document.querySelector('button.md-fab[ng-click*="save"]');
                        if (originalBtn) {
                            isDisabled = originalBtn.classList.contains('ng-hide') || originalBtn.disabled;
                        }
                    }
                } catch (e) {
                    // Fallback de segurança
                    var originalBtn = document.querySelector('button.md-fab[ng-click*="save"]');
                    if (originalBtn) {
                        isDisabled = originalBtn.classList.contains('ng-hide') || originalBtn.disabled;
                    }
                }

                btn.disabled = isDisabled;
                btn.classList.toggle('tcl-pref-save-disabled', isDisabled);
            }

            footer.appendChild(btn);
            innerContainer.appendChild(footer);

            setInterval(syncDisabledState, 500);
            syncDisabledState();
        });
    }

    var prefSaveObserver = new MutationObserver(function() {
        if (window.location.href.indexOf('Preferences') === -1) return;
        var hasContent = document.querySelector('md-tab-content > div[md-tabs-template]') || document.querySelector('div[ui-view="module"] > md-content');
        if (hasContent) {
            setTimeout(injectUniversalSaveButton, 300);
        }
    });
    
    prefSaveObserver.observe(document.body, { childList: true, subtree: true });
    setTimeout(injectUniversalSaveButton, 500);
})();
// ─────────────────────────────────────────────────────────────────────────────

// ─── Rodapé do Formulário de Contato (Criar/Editar) ─────────────────────────
(function() {
    var isContacts = /\/Contacts\b/.test(window.location.pathname + window.location.hash);
    if (!isContacts) return;

    function injectContactFooter() {
        var detailView = document.getElementById('detailView');
        if (!detailView) return;

        // Verifica se o formulário de contato está ativo
        var form = detailView.querySelector('form[name="contactForm"]');
        if (!form) return;

        // Evita injetar duplicado
        if (document.getElementById('tcl-contact-footer')) return;

        // Busca os botões nativos no toolbar
        var btnCancel = document.querySelector('#detailView button[aria-label="Cancelar"]');
        var btnReset  = document.querySelector('#detailView button[aria-label="Limpar"]');
        var btnSave   = document.querySelector('#detailView button[aria-label="Salvar"]');

        if (!btnCancel && !btnSave) return; // toolbar ainda não renderizou

        // Cria o rodapé
        var footer = document.createElement('div');
        footer.id = 'tcl-contact-footer';
        footer.className = 'tcl-contact-footer';

        // Botão Restaurar (mapeia para Limpar/Undo)
        if (btnReset) {
            var bReset = document.createElement('button');
            bReset.type = 'button';
            bReset.textContent = 'Restaurar';
            bReset.onclick = function() { btnReset.click(); };
            footer.appendChild(bReset);
        }

        // Botão Cancelar
        if (btnCancel) {
            var bCancel = document.createElement('button');
            bCancel.type = 'button';
            bCancel.textContent = 'Cancelar';
            bCancel.onclick = function() { btnCancel.click(); };
            footer.appendChild(bCancel);
        }

        // Botão Salvar (teal, reflete estado disabled)
        if (btnSave) {
            var bSave = document.createElement('button');
            bSave.type = 'button';
            bSave.className = 'tcl-btn-save';
            bSave.textContent = 'Salvar';
            bSave.onclick = function() { if (!bSave.disabled) { btnSave.click(); } };
            footer.appendChild(bSave);

            // Sincroniza o estado disabled com o botão nativo
            var syncSave = function() {
                bSave.disabled = btnSave.disabled || btnSave.hasAttribute('disabled');
            };
            syncSave();
            var saveObserver = new MutationObserver(syncSave);
            saveObserver.observe(btnSave, { attributes: true, attributeFilter: ['disabled'] });
        }

        // Garante que o detailView seja relativo para o posicionamento absolute do rodapé
        detailView.style.position = 'relative';
        detailView.appendChild(footer);
    }

    // Observa o DOM esperando o formulário aparecer
    var contactFormObserver = new MutationObserver(function() {
        if (!document.getElementById('tcl-contact-footer')) {
            injectContactFooter();
        }
    });

    contactFormObserver.observe(document.body, { childList: true, subtree: true });
    setTimeout(injectContactFooter, 800);
})();
// ─────────────────────────────────────────────────────────────────────────────

// ─── Avatar e Formatação de Endereço na Tela de Detalhes do Contato ───────
(function() {
    function injectContactViewFeatures() {
        var detailView = document.getElementById('detailView');
        if (!detailView) return;

        // O avatar volta a ser apenas o ícone padrão do SOGo transparente para seguir o design

        // 2. Quebrar o Endereço em 5 caixas separadas como no design (se houver endereço)
        var addressContainers = detailView.querySelectorAll('.msg-body > div[ng-show="editor.card.addresses"] .pseudo-input-container');
        
        addressContainers.forEach(function(container) {
            if (container.querySelector('.tcl-rebuilt-address')) return;
            
            // Pega o escopo do Angular diretamente do container do ng-repeat
            var scope = window.angular ? angular.element(container).scope() : null;
            if (!scope || !scope.address) {
                // Tenta no isolateScope caso seja isolado
                var sgAddress = container.querySelector('div[sg-address]');
                if (sgAddress) {
                    var isoScope = angular.element(sgAddress).isolateScope();
                    if (isoScope && isoScope.address) scope = isoScope;
                }
            }
            if (!scope || !scope.address) return;
            var address = scope.address;
            
            // Esconde os elementos originais
            var originalField = container.querySelector('.pseudo-input-field');
            if (originalField) originalField.style.display = 'none';
            var originalLabel = container.querySelector('.pseudo-input-label');
            if (originalLabel) originalLabel.style.display = 'none';
            
            // Cria a nova estrutura replicando o design (2 colunas)
            var wrapper = document.createElement('div');
            wrapper.className = 'tcl-rebuilt-address';
            wrapper.style.display = 'grid';
            wrapper.style.gridTemplateColumns = '1fr 1fr';
            wrapper.style.gap = '24px';
            wrapper.style.width = '100%';
            
            function createField(labelText, value, span2) {
                var box = document.createElement('div');
                box.className = 'pseudo-input-container';
                if (span2) box.style.gridColumn = '1 / -1';
                
                if (labelText) {
                    var lbl = document.createElement('label');
                    lbl.className = 'pseudo-input-label';
                    lbl.textContent = labelText;
                    box.appendChild(lbl);
                } else {
                    // Create a spacer so the box aligns correctly with labeled boxes
                    var spacer = document.createElement('div');
                    spacer.className = 'pseudo-input-label';
                    spacer.innerHTML = '&nbsp;';
                    box.appendChild(spacer);
                }
                
                var fld = document.createElement('div');
                fld.className = 'pseudo-input-field';
                fld.style.cursor = 'not-allowed';
                fld.textContent = value || '';
                
                box.appendChild(fld);
                return box;
            }
            
            var typeLabel = address.type ? address.type.charAt(0).toUpperCase() + address.type.slice(1) : '';
            var addressTitle = typeLabel ? 'Endereço (' + typeLabel + ')' : 'Endereço';
            
            wrapper.appendChild(createField(addressTitle, address.street, true));
            wrapper.appendChild(createField('', address.locality, false));
            wrapper.appendChild(createField('', address.region, false));
            wrapper.appendChild(createField('', address.country, false));
            wrapper.appendChild(createField('', address.postalcode, false));
            
            container.appendChild(wrapper);
        });
    }

    var observer = new MutationObserver(function() {
        if (document.getElementById('detailView')) {
            injectContactViewFeatures();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(injectContactViewFeatures, 500);
})();

// ─── Auto-abrir Edição ao Clicar no Contato ──────────────────────────────
(function() {
    // Detecta o clique na lista de contatos
    document.addEventListener('click', function(e) {
        if (window.location.href.indexOf('Contacts') === -1) return;
        
        var btn = e.target.closest('button[ng-click*="selectCard"], md-list-item');
        if (btn) {
            // Em vez de depender de escopos do Angular (que estão bloqueados em produção),
            // ou de eventos hashchange (que o Angular cancela),
            // nós vigiamos a URL a cada milissegundo.
            var maxTries = 40; // Tenta por 2 segundos
            var tries = 0;
            var watchUrl = setInterval(function() {
                tries++;
                var currentHash = window.location.hash;
                
                // Assim que o SOGo colocar .vcf na URL, nós sequestramos e botamos /edit
                if (currentHash.match(/\.vcf$/)) {
                    clearInterval(watchUrl);
                    // window.location.replace não cria histórico fantasma e engata a rota
                    window.location.replace(window.location.href + '/edit');
                }
                
                if (tries > maxTries) {
                    clearInterval(watchUrl);
                }
            }, 50);
        }
    }, true);
})();
