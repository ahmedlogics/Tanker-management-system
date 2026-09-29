"""
TMMS Root Application Entrypoint
Imports the primary Flask application from api/index.py for seamless local execution
while allowing Vercel to discover and execute api/index.py as the serverless function.
"""
import os
from api.index import app

if __name__ == '__main__':
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    print(f"Starting TMMS Flask backend on port {port} (debug={debug})...")
    app.run(debug=debug, port=port)