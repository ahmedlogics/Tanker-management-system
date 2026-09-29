# Alias to ensure Vercel locates the application regardless of entrypoint name preference (index.py or app.py)
from api.index import app

if __name__ == '__main__':
    app.run()
