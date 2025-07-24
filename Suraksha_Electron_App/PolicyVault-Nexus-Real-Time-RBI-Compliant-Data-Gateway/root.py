import os

EXCLUDED = {'venv', '__pycache__', '.git', 'node_modules'}

def print_tree(start_path, prefix=""):
    entries = sorted(os.listdir(start_path))
    entries = [e for e in entries if e not in EXCLUDED]
    for index, entry in enumerate(entries):
        path = os.path.join(start_path, entry)
        connector = "└── " if index == len(entries) - 1 else "├── "
        print(f"{prefix}{connector}{entry}")
        if os.path.isdir(path):
            extension = "    " if index == len(entries) - 1 else "│   "
            print_tree(path, prefix + extension)

if __name__ == "__main__":
    print_tree(".")
