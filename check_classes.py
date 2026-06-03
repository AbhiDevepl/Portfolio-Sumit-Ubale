import re
import os

def check_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Simple heuristic: find classes and check for commas at the end of lines inside them
    # but not inside objects or arrays. This is hard with regex.
    # Let's just look for lines that look like method ends followed by a comma.

    matches = re.finditer(r'\}\s*,', content)
    for match in matches:
        print(f"Found suspicious comma at {filepath}:{content.count('\n', 0, match.start()) + 1}")

for root, dirs, files in os.walk('scripts'):
    for file in files:
        if file.endswith('.js'):
            check_file(os.path.join(root, file))
