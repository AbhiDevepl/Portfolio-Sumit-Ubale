import re

filepath = "scripts/portfolio-gallery.js"
with open(filepath, "r") as f:
    content = f.read()

# Replace class with function-based prototypes
# (Too complex for simple regex, let's try just const/let first)

content = content.replace("const ", "var ")
content = content.replace("let ", "var ")

# Arrow functions (I thought I removed them all but let's check)
# My grep above didn't show any, but check .map/.forEach
# Wait, I used map(function(item, i) { ... }) which is ES5.

with open(filepath, "w") as f:
    f.write(content)
