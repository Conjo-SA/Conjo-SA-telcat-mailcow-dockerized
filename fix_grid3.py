import re

with open("data/conf/sogo/teclat-premium.css", "r") as f:
    css = f.read()

append = """
/* Forçar os Inputs de URL para BAIXO dos botões */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > div.layout-row.layout-align-start-center:has(md-input-container),
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > div[ng-repeat*="attach"] {
    grid-column: 1 / 3 !important;
    grid-row: auto !important;
}
"""

css = css.replace("/* ===== MAPEAMENTO DO GRID - SEÇÃO 2 (Datas e Checkboxes) ===== */", append + "\n/* ===== MAPEAMENTO DO GRID - SEÇÃO 2 (Datas e Checkboxes) ===== */")

with open("data/conf/sogo/teclat-premium.css", "w") as f:
    f.write(css)

print("URL logic added")
