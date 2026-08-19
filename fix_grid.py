import re

with open("data/conf/sogo/teclat-premium.css", "r") as f:
    css = f.read()

# Replace the entire Section 1 grid mapping block
new_grid = """
/* ===== MAPEAMENTO DO GRID - SEÇÃO 1 ===== */
/* Localização */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > div.layout-row > md-input-container:nth-child(1) {
    grid-column: 1 !important;
    grid-row: 1 !important;
}
/* Calendário */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > div.layout-row > md-input-container:nth-child(2) {
    grid-column: 2 !important;
    grid-row: 1 !important;
}
/* Descrição */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > md-input-container {
    grid-column: 1 !important;
    grid-row: 2 !important;
}
/* Prioridade */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > div.layout-row > .pseudo-input-container {
    grid-column: 2 !important;
    grid-row: 2 !important;
    align-self: flex-start !important;
    margin-top: 0 !important;
}
/* Categoria */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > md-chips {
    grid-column: 1 !important;
    grid-row: 3 !important;
}
/* Privacidade */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > div.layout-row > md-radio-group,
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > md-radio-group {
    grid-column: 2 !important;
    grid-row: 3 !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 16px !important;
    margin: 0 !important;
    padding: 0 !important;
    align-self: flex-start !important;
    margin-top: 12px !important;
}
/* Enviar Notificações */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > md-checkbox {
    grid-column: 2 !important;
    grid-row: 4 !important;
    margin: 0 !important;
    align-self: center !important;
}
/* Botões Meet e Anexar - forçar na coluna 1 */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > div.layout-row.layout-align-start-center {
    grid-column: 1 !important;
    align-self: center !important;
    margin-top: 8px !important;
    width: 100% !important;
}
/* Distinguir Meet e Anexar pela ordem no DOM */
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > div.layout-row.layout-align-start-center:nth-of-type(4) {
    grid-row: 5 !important;
}
.tcl-event-modal md-dialog-content .sg-form-section:nth-of-type(1) > div.layout-row.layout-align-start-center:nth-of-type(5) {
    grid-row: 4 !important;
}
"""

css = re.sub(r'/\* ===== MAPEAMENTO DO GRID - SEÇÃO 1 ===== \*/.*?(?=/\* ===== MAPEAMENTO DO GRID - SEÇÃO 2 \(Datas e Checkboxes\) ===== \*/)', new_grid + '\n', css, flags=re.DOTALL)

with open("data/conf/sogo/teclat-premium.css", "w") as f:
    f.write(css)

print("Grid updated")
