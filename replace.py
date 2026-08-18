import re

css_path = 'data/conf/sogo/teclat-premium.css'
with open(css_path, 'r') as f:
    content = f.read()

# We will replace md-dialog:has(form[name="eventForm"]) with md-dialog:has(form[name="eventForm"]), md-dialog:has(form[name="taskForm"]), md-dialog:has(md-icon[aria-label="assignment_turned_in"])
# But let's be smart. Let's just create a generic class.
# Wait, actually, let's just do a regex replace:
new_content = content.replace('md-dialog:has(form[name="eventForm"])', 'md-dialog:has(form[name="eventForm"]), md-dialog:has(form[name="taskForm"])')

with open(css_path, 'w') as f:
    f.write(new_content)

print("Replaced!")
