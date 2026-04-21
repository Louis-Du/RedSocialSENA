#!/bin/bash

# ============================================================
# VERIFICACIÓN DE INTEGRIDAD - REFACTORIZACIÓN COMPLETADA
# ============================================================

echo "🔍 VERIFICANDO INTEGRIDAD DE LA REFACTORIZACIÓN..."
echo ""

cd "$(dirname "$0")/src" || exit 1

# ============================================================
# 1. VERIFICAR ESTRUCTURA DE MÓDULOS
# ============================================================
echo "1️⃣ VERIFICANDO ESTRUCTURA DE MÓDULOS"
echo "=================================="

expected_modules=("auth" "post" "chat" "common")
all_exist=true

for module in "${expected_modules[@]}"; do
    if [ -d "modules/$module" ]; then
        file_count=$(find "modules/$module" -name "*.js" -type f | wc -l)
        echo "  ✅ modules/$module/ existe ($file_count archivos .js)"
    else
        echo "  ❌ modules/$module/ NO EXISTE"
        all_exist=false
    fi
done

echo ""

# ============================================================
# 2. VERIFICAR QUE LAS ESTRUCTURAS ANTIGUAS FUERON ELIMINADAS
# ============================================================
echo "2️⃣ VERIFICANDO QUE ESTRUCTURAS ANTIGUAS FUERON ELIMINADAS"
echo "=========================================================="

old_structures=("services" "state" "ui" "data")
all_removed=true

for struct in "${old_structures[@]}"; do
    if [ ! -d "$struct" ]; then
        echo "  ✅ $struct/ fue eliminado correctamente"
    else
        echo "  ❌ $struct/ AÚN EXISTE (debería estar eliminado)"
        all_removed=false
    fi
done

if [ ! -f "core/AppState.js" ]; then
    echo "  ✅ core/AppState.js fue eliminado"
else
    echo "  ❌ core/AppState.js AÚN EXISTE"
    all_removed=false
fi

echo ""

# ============================================================
# 3. VERIFICAR QUE NO HAY REFERENCIAS A ESTRUCTURAS ANTIGUAS
# ============================================================
echo "3️⃣ VERIFICANDO AUSENCIA DE REFERENCIAS ANTIGUAS"
echo "================================================"

old_refs=0

# Buscar referencias a servicios antiguos
if grep -r "from.*services/" --include="*.js" . 2>/dev/null | grep -v "docs" > /dev/null; then
    echo "  ⚠️ ADVERTENCIA: Se encontraron importaciones de '../services/'"
    grep -r "from.*services/" --include="*.js" . 2>/dev/null | grep -v "docs" | head -3
    old_refs=$((old_refs + 1))
else
    echo "  ✅ No hay importaciones de '../services/'"
fi

# Buscar referencias a estado antiguo
if grep -r "from.*state/" --include="*.js" . 2>/dev/null | grep -v "docs" > /dev/null; then
    echo "  ⚠️ ADVERTENCIA: Se encontraron importaciones de '../state/'"
    grep -r "from.*state/" --include="*.js" . 2>/dev/null | grep -v "docs" | head -3
    old_refs=$((old_refs + 1))
else
    echo "  ✅ No hay importaciones de '../state/'"
fi

# Buscar referencias a ui antiguo (excepto en HTML)
if grep -r "from.*ui/" --include="*.js" . 2>/dev/null | grep -v "docs" | grep -v "views" > /dev/null; then
    echo "  ⚠️ ADVERTENCIA: Se encontraron importaciones de '../ui/'"
    grep -r "from.*ui/" --include="*.js" . 2>/dev/null | grep -v "docs" | grep -v "views" | head -3
    old_refs=$((old_refs + 1))
else
    echo "  ✅ No hay importaciones de '../ui/'"
fi

echo ""

# ============================================================
# 4. VERIFICAR ARCHIVOS CLAVE EXISTEN
# ============================================================
echo "4️⃣ VERIFICANDO ARCHIVOS CLAVE"
echo "=============================="

key_files=(
    "core/bootstrap.js"
    "core/main.js"
    "modules/auth/index.js"
    "modules/post/index.js"
    "modules/chat/index.js"
    "modules/common/index.js"
    "utils/utils.js"
    "vendor/lucide.min.js"
    "index.html"
)

all_exist_key=true
for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file NO EXISTE"
        all_exist_key=false
    fi
done

echo ""

# ============================================================
# 5. VERIFICAR index.html TIENE REFERENCIAS CORRECTAS
# ============================================================
echo "5️⃣ VERIFICANDO index.html"
echo "========================"

if grep -q "vendor/lucide.min.js" index.html; then
    echo "  ✅ index.html referencia vendor/lucide.min.js"
else
    echo "  ❌ index.html NO referencia vendor/lucide.min.js"
fi

if grep -q "core/bootstrap.js" index.html; then
    echo "  ✅ index.html referencia core/bootstrap.js"
else
    echo "  ❌ index.html NO referencia core/bootstrap.js"
fi

echo ""

# ============================================================
# 6. ESTADÍSTICAS FINALES
# ============================================================
echo "6️⃣ ESTADÍSTICAS FINALES"
echo "======================"

total_js=$(find . -name "*.js" -type f | wc -l)
modules_js=$(find modules -name "*.js" -type f 2>/dev/null | wc -l)
core_js=$(find core -name "*.js" -type f 2>/dev/null | wc -l)
utils_js=$(find utils -name "*.js" -type f 2>/dev/null | wc -l)

echo "  Archivos .js totales en src/: $total_js"
echo "  - En modules/: $modules_js"
echo "  - En core/: $core_js"
echo "  - En utils/: $utils_js"

echo ""

# ============================================================
# RESUMEN FINAL
# ============================================================
echo "=" * 50
if [ "$all_exist" = true ] && [ "$all_removed" = true ] && [ "$old_refs" -eq 0 ] && [ "$all_exist_key" = true ]; then
    echo "✅ ¡REFACTORIZACIÓN COMPLETADA EXITOSAMENTE!"
    echo ""
    echo "Próximos pasos:"
    echo "1. Ejecutar servidor dev: python3 -m http.server 8080 --bind 127.0.0.1 --directory ."
    echo "2. Abrir http://localhost:8080/index.html en navegador"
    echo "3. Verificar en console que NO hay errores"
    echo "4. Probar funcionalidad: login, crear post, chat"
    exit 0
else
    echo "⚠️ VERIFICACIÓN INCOMPLETA - Revisar advertencias arriba"
    exit 1
fi
