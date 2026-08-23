import re

css_path = 'data/conf/sogo/teclat-premium.css'
with open(css_path, 'r') as f:
    content = f.read()

new_content = content.replace('md-dialog:has(form[name="eventForm"]), md-dialog:has(form[name="taskForm"])', 'md-dialog:has(form[name="eventForm"]), md-dialog:has(form[name="taskForm"]), md-dialog:has(md-icon[aria-label="assignment_turned_in"])')

with open(css_path, 'w') as f:
    f.write(new_content)

print("Replaced 2!")
