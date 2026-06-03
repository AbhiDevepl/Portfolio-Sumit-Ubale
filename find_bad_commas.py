import re
import os

def find_bad_commas(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # This regex tries to find a closing brace of a method followed by a comma
    # and then another method-like identifier or another closing brace of the class.
    # It's still a heuristic but better.
    matches = re.finditer(r'\}\s*,\s*(?=[a-zA-Z_]|\})', content)
    found = False
    for match in matches:
        # Check if we are inside a class or an object.
        # A simple way is to check if 'class ' exists before in the file.
        # But even better, let's just report them and I'll manually check.
        line_no = content.count('\n', 0, match.start()) + 1
        print(f"{filepath}:{line_no}: Potential bad comma")
        found = True
    return found

for root, dirs, files in os.walk('scripts'):
    for file in files:
        if file.endswith('.js'):
            find_bad_commas(os.path.join(root, file))
