import re

with open("data/conf/sogo/teclat-premium.css", "r") as f:
    css = f.read()

rule = """
/* Quebrar os div.layout-row do SOGo (para que participem do Grid da seção) */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > div.layout-row:not(.layout-align-start-center) {
    display: contents !important;
}
/* ===== MAPEAMENTO DO GRID - SEÇÃO 1 ===== */
"""

css = css.replace("/* ===== MAPEAMENTO DO GRID - SEÇÃO 1 ===== */", rule)

with open("data/conf/sogo/teclat-premium.css", "w") as f:
    f.write(css)

print("Grid contents rule added")
