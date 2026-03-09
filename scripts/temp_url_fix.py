import json

file_path = "data/portfolio.json"

def update_sirv_urls(data):
    if isinstance(data, dict):
        for key, value in list(data.items()):
            if key == "src" and isinstance(value, str) and "sirv.com" in value:
                if "profile=true" not in value:
                    separator = "&" if "?" in value else "?"
                    data[key] = value + separator + "profile=true"
            else:
                update_sirv_urls(value)
    elif isinstance(data, list):
        for item in data:
            update_sirv_urls(item)

with open(file_path, "r") as f:
    data = json.load(f)

update_sirv_urls(data["portfolio"])

with open(file_path, "w") as f:
    json.dump(data, f, indent=2)

print("Successfully updated Sirv URLs in portfolio.json")
