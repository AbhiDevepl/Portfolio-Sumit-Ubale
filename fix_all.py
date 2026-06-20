import re

filepath = "scripts/portfolio-gallery.js"
with open(filepath, "r") as f:
    content = f.read()

# 1. Remove optional chaining (grep showed none but let's be sure)
content = re.sub(r'(\w+)\s*\?\.\s*(\w+)', r'(\1 && \1.\2)', content)

# 2. Remove nullish coalescing
content = re.sub(r'\s*\?\?\s*', ' !== undefined ? ... : ', content) # That's not easy via regex

# Let's do explicit replacements for what I know is there
content = content.replace("PortfolioGallery.CATEGORY_WEIGHTS[category] ?? 999", "PortfolioGallery.CATEGORY_WEIGHTS[category] !== undefined ? PortfolioGallery.CATEGORY_WEIGHTS[category] : 999")
# (I already had !== undefined in the file though)

# 3. Replace template literals
def replace_template(match):
    s = match.group(1)
    # Replace ${var} with " + var + "
    s = re.sub(r'$\{(.*?)\}', r'" + \1 + "', s)
    return '"' + s + '"'

content = re.sub(r'', replace_template, content, flags=re.DOTALL)

# 4. Remove all trailing commas in objects/arrays
content = re.sub(r',\s*([}\]])', r'\1', content)

with open(filepath, "w") as f:
    f.write(content)
