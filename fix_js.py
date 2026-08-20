import re

js_path = 'data/conf/sogo/custom-sogo.js'
with open(js_path, 'r') as f:
    content = f.read()

# Currently it's:
# } else if (dialog.querySelector('form[name="eventForm"]')) {
#   dialog.classList.add('tcl-event-modal');
#   dialog.classList.remove('md-dialog-fullscreen');
#   setupEventModal(dialog);
# }

new_content = content.replace(
    "} else if (dialog.querySelector('form[name=\"eventForm\"]')) {",
    "} else if (dialog.querySelector('form[name=\"eventForm\"]') || dialog.querySelector('form[name=\"taskForm\"]') || dialog.querySelector('md-icon[aria-label=\"assignment_turned_in\"]')) {"
)

new_content = new_content.replace(
    "} else if (node.querySelector('form[name=\"eventForm\"]')) {",
    "} else if (node.querySelector('form[name=\"eventForm\"]') || node.querySelector('form[name=\"taskForm\"]') || node.querySelector('md-icon[aria-label=\"assignment_turned_in\"]')) {"
)

with open(js_path, 'w') as f:
    f.write(new_content)

print("JS Fixed!")
