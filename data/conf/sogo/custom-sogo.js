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
          <div class="tcl-menu-popup" id="tcl-menu-popup">
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
