# crear_issues_desde_word.py
import os
import re
from github import Github
from docx import Document
from typing import List, Dict

# ---------- CONFIG ----------
# Cambia esto por el repo donde quieres crear issues (usuario/repo)
REPO_NAME = "https://github.com/Louis-Du/RedSocialSENA"  # ej: "lukasdiaz/red-social-sena"

# Nombre del archivo .docx en el repo (ruta relativa)
ARCHIVO_WORD = "code/historias_usuario_sena_mejorada.docx"

# Si quieres forzar dry-run sin tocar GitHub: define DRY_RUN=1 en variables de entorno
DRY_RUN = os.getenv("DRY_RUN", "0") in ("1", "true", "True")

# ---------- HELPERS ----------
def es_inicio_hu(text: str) -> bool:
    # Detecta "Historia de Usuario RF-01" o "HU-01:" o "HU-01 -"
    return bool(re.match(r"(Historia de Usuario\s+RF-\d+)|(HU-\d+[:\s-])", text, re.IGNORECASE))

def extraer_id_nombre_desde_linea(text: str) -> (str, str):
    # Maneja: "Historia de Usuario RF-01" (id separado) o "HU-01: Como..."
    m_hu = re.match(r"(HU-\d+)\s*[:\-\s]\s*(.*)", text, re.IGNORECASE)
    if m_hu:
        return m_hu.group(1).strip(), m_hu.group(2).strip()
    m_rf = re.match(r"Historia de Usuario\s+(RF-\d+)", text, re.IGNORECASE)
    if m_rf:
        return m_rf.group(1).strip(), ""
    # fallback: tira todo como nombre
    return "", text.strip()

def normalizar_criterio(line: str) -> str:
    # "CA: Texto..." -> "Texto..."
    return re.sub(r"^CA\s*[:\-]\s*", "", line, flags=re.IGNORECASE).strip()

# ---------- PARSER ----------
def extraer_historias(archivo: str) -> List[Dict]:
    doc = Document(archivo)
    historias = []
    current = None
    in_pruebas = False

    for p in doc.paragraphs:
        t = p.text.strip()
        if not t:
            continue

        # Si línea inicia una HU
        if es_inicio_hu(t):
            # si había una historia en curso, guardarla
            if current:
                historias.append(current)
            hid, rest = extraer_id_nombre_desde_linea(t)
            current = {"id": hid or "", "descripcion": rest or "", "criterios": []}
            in_pruebas = False
            continue

        # Si detecta "Historia de Usuario RF-01" como encabezado separado y luego "Nombre de la historia" + linea siguiente
        if re.search(r"Nombre de la historia", t, re.IGNORECASE):
            # next paragraph likely contains the name - handled by following iteration
            in_pruebas = False
            continue

        # Detecta el bloque "Pruebas de aceptación" o "Criterios de aceptación"
        if re.search(r"(Pruebas de aceptación|Criterios de aceptación)", t, re.IGNORECASE):
            in_pruebas = True
            continue

        # Si la línea empieza con "CA:" (tu formato simple)
        if re.match(r"^CA\s*[:\-]", t, re.IGNORECASE):
            if not current:
                # crea una historia "sin id" si no existe
                current = {"id": "", "descripcion": "", "criterios": []}
            current["criterios"].append(normalizar_criterio(t))
            continue

        # Si estamos en el modo de pruebas donde las pruebas vienen con "-" como viñetas
        if in_pruebas and t.startswith("-"):
            if not current:
                current = {"id": "", "descripcion": "", "criterios": []}
            current["criterios"].append(t.lstrip("-").strip())
            continue

        # Si no es criterio pero pertenece a la descripción (texto largo)
        if current:
            # Si description vacía, setear; si ya existe, concatenar
            if not current["descripcion"]:
                current["descripcion"] = t
            else:
                current["descripcion"] += " " + t
        else:
            # Si no hay current, pero encontramos una línea larga que parece ser "HU-XX: ..." sin prefijo
            # intentamos ver si tiene formato "RF-01" dentro del texto
            m = re.match(r"(RF-\d+)\s*[:\-]\s*(.+)", t, re.IGNORECASE)
            if m:
                current = {"id": m.group(1).strip(), "descripcion": m.group(2).strip(), "criterios": []}

    # añadir la última historia si existe
    if current:
        historias.append(current)
    return historias

# ---------- CREAR ISSUE ----------
def crear_issue(repo, h: Dict):
    title_parts = []
    if h.get("id"):
        title_parts.append(h["id"])
    # para título, intenta tomar primeras 60 chars de descripción si existe
    extra = (h.get("descripcion") or "").split("\n")[0].strip()
    if extra:
        title_parts.append(extra[:60])
    title = " - ".join(title_parts) if title_parts else "Historia sin id"

    criterios = h.get("criterios", [])
    criterios_md = "\n".join([f"- {c}" for c in criterios]) if criterios else "- (sin criterios listados)"

    body = f"""**Historia de usuario:**  
{h.get('descripcion','(sin descripción)')}

**Criterios de aceptación:**  
{criterios_md}
"""

    if DRY_RUN:
        print("------ DRY RUN (no se crea issue) ------")
        print("TÍTULO:", title)
        print("CUERPO:\n", body)
        print("---------------------------------------\n")
        return None

    issue = repo.create_issue(title=title, body=body)
    print(f"✅ Issue creado: {issue.title} -> {issue.html_url}")
    return issue

# ---------- MAIN ----------
def main():
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise SystemExit("ERROR: no se encontró la variable de entorno GITHUB_TOKEN")

    if not os.path.isfile(ARCHIVO_WORD):
        raise SystemExit(f"ERROR: no se encontró el archivo {ARCHIVO_WORD} en la ruta actual.")

    historias = extraer_historias(ARCHIVO_WORD)
    print(f"📄 Historias encontradas: {len(historias)}")
    if not historias:
        return

    g = Github(token)
    repo = g.get_repo(REPO_NAME)

    for h in historias:
        crear_issue(repo, h)

if __name__ == "__main__":
    main()
