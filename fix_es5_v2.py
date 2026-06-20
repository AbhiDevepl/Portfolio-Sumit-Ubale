import re

filepath = "scripts/portfolio-gallery.js"
with open(filepath, "r") as f:
    content = f.read()

# 1. Classes to functions
# This is a very basic converter for this specific file structure

def convert_class(match):
    name = match.group(1)
    body = match.group(2)

    # Extract constructor
    constructor_match = re.search(r'constructor\((.*?)\)\s*\{(.*?)\n\s*\}', body, re.DOTALL)
    if constructor_match:
        params = constructor_match.group(1)
        c_body = constructor_match.group(2)
        out = "var " + name + " = function(" + params + ") {\n" + c_body + "\n};\n"
    else:
        out = "var " + name + " = function() {};\n"

    # Extract methods
    methods = re.findall(r'\n\s*(?!constructor|static)(\w+)\((.*?)\)\s*\{(.*?)\n\s*\}', body, re.DOTALL)
    for m_name, m_params, m_body in methods:
        out += name + ".prototype." + m_name + " = function(" + m_params + ") {\n" + m_body + "\n};\n"

    return out

content = re.sub(r'class (\w+)\s*\{(.*?)\n\}', convert_class, content, flags=re.DOTALL)

# 2. Async/Await to Promises
# setup()
content = content.replace("async setup()", "setup()")
content = content.replace("var data = await this.fetchData();", "var self = this;\n    return this.fetchData().then(function(data) {")
# Close the then block and catch block
content = content.replace("this.modal.init();\n\n      if (window.Core && window.Core.Lightbox) {\n        window.Core.Lightbox.init();\n      }\n\n    } catch (error) {",
                          "self.modal.init();\n\n      if (window.Core && window.Core.Lightbox) {\n        window.Core.Lightbox.init();\n      }\n    }).catch(function(error) {")

# init()
content = content.replace("async init()", "init()")

# fetchData()
content = content.replace("async fetchData()", "fetchData()")
content = content.replace("var response = await fetch('/data/portfolio.json');", "return fetch('/data/portfolio.json').then(function(response) {")
content = content.replace("if (!response.ok) {\n      throw new Error('Failed to fetch portfolio data');\n    }\n    return response.json();",
                          "if (!response.ok) {\n      throw new Error('Failed to fetch portfolio data');\n    }\n    return response.json();\n    });")

with open(filepath, "w") as f:
    f.write(content)
