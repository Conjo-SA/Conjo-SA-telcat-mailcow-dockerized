import re

css_path = 'data/conf/sogo/teclat-premium.css'
with open(css_path, 'r') as f:
    content = f.read()

# Make sure we are in the original state where no comma separation was added
# The user said they reverted, so we should just search for md-dialog:has(form[name="eventForm"])
old_str = 'md-dialog:has(form[name="eventForm"])'
new_str = ':is(md-dialog:has(form[name="eventForm"]), md-dialog:has(md-icon[aria-label="assignment_turned_in"]))'

# Check if the file was actually fully reverted
if 'md-dialog:has(form[name="eventForm"]),' in content:
    print("Warning: File still contains the broken comma separated rules! Reverting first...")
    # Actually, if they reverted, it shouldn't be there.
    # We can just manually fix it by replacing the broken ones back to old_str
    content = content.replace('md-dialog:has(form[name="eventForm"]), md-dialog:has(form[name="taskForm"]), md-dialog:has(md-icon[aria-label="assignment_turned_in"])', old_str)
    content = content.replace('md-dialog:has(form[name="eventForm"]), md-dialog:has(form[name="taskForm"])', old_str)

new_content = content.replace(old_str, new_str)

with open(css_path, 'w') as f:
    f.write(new_content)

print("Replaced safely!")
