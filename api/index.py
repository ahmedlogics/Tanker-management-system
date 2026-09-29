import sys
from pathlib import Path

# Add project root directory to sys.path so app.py can be resolved
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

# Import Flask instance
from app import app

# Vercel looks for the 'app' variable in this file
if __name__ == "__main__":
    app.run()
