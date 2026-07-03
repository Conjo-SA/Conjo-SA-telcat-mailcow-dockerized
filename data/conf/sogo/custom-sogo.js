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
CKEDITOR.addCss("body {font-size: 16px !important}");

// Enable scayt by default
//CKEDITOR.config.scayt_autoStartup = true;

// --- Teclat Meet: rename the "online meeting" button label -----------------
// SOGo renders the videoconference button with the "Create Jitsi Meeting"
// label (translated e.g. to "Criar Reunião no Jitsi"). We relabel it to match
// the Teclat Meet branding. This runs only on the calendar event editor and
// does not change any other behaviour.
(function () {
    var NEW_LABEL = "Criar Reunião no Meet TeclaT";

    function relabelJitsiButtons(root) {
        var labels = (root || document).querySelectorAll(".button-label");
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
// ---------------------------------------------------------------------------

