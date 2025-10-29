from github import Github, Auth
import os

# Lee tu token de entorno (igual que el script principal)
token = os.getenv("GITHUB_TOKEN")
if not token:
    raise SystemExit("❌ ERROR: No se encontró la variable GITHUB_TOKEN. Define tu token antes de ejecutar este script.")

# Conecta usando la forma moderna (sin warnings)
from github import Auth
auth = Auth.Token(token)
g = Github(auth=auth)

# Coloca aquí el repositorio exacto que quieres probar
REPO_NAME = "Louis-Du/RedSocialSENA"

try:
    repo = g.get_repo(REPO_NAME)
    print(f"✅ Conexión exitosa: tienes acceso a {repo.full_name}")
    print(f"   Descripción: {repo.description}")
    print(f"   Es privado?: {'Sí' if repo.private else 'No'}")
except Exception as e:
    print("❌ No se pudo acceder al repositorio.")
    print(e)
