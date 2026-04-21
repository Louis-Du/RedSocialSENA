# 🧪 PLAN DE PRUEBAS - Firebase + Múltiples Dispositivos

## 🎯 Objetivo
Verificar que todas las funcionalidades funcionan en tiempo real con Firebase cuando múltiples usuarios acceden desde dispositivos diferentes.

---

## 📋 Preparación

### Requisitos
- [ ] 2 o más dispositivos en la misma red WiFi (o misma computadora en navegadores distintos)
- [ ] Firebase configurado y funcionando
- [ ] Servidor ejecutándose: `python3 -m http.server 8080 --bind 0.0.0.0`
- [ ] IP local disponible (ej: 192.168.1.100)

### Cuentas de Prueba Necesarias

| Usuario | Tipo Doc | Documento | Contraseña |
|---------|----------|-----------|-----------|
| Alice   | CC       | 10000001  | Test@123  |
| Bob     | TI       | 20000002  | Test@123  |
| Carlos  | CE       | 30000003  | Test@123  |

---

## 🧪 Test 1: Autenticación Cross-Device ✅

### Objetivo: Verificar login simultáneo

**Paso 1: Alice (Dispositivo A)**
```
URL: http://192.168.1.100:8080/index.html
1. Click en "Registrarse"
2. Tipo: CC | Documento: 10000001 | Contraseña: Test@123
3. Click crear cuenta
```

**Resultado esperado:**
- ✅ Se registra exitosamente
- ✅ Ve su perfil con nombre "Alice"
- ✅ Acceso al feed

**Paso 2: Bob (Dispositivo B)**
```
URL: http://192.168.1.100:8080/index.html
1. Click en "Registrarse"
2. Tipo: TI | Documento: 20000002 | Contraseña: Test@123
3. Click crear cuenta
```

**Resultado esperado:**
- ✅ Bob se registra sin conflictos
- ✅ Alice sigue logueada en Dispositivo A
- ✅ Ambos ven el feed

---

## 🧪 Test 2: Publicaciones en Tiempo Real 📝

### Objetivo: Ver actualización instantánea de posts

**Paso 1: Alice crea publicación**
```
Dispositivo A (Alice)
1. Click en "Crear publicación"
2. Escribir: "¡Hola desde Alice en el dispositivo A!"
3. Click "Publicar"
```

**Paso 2: Bob ve publicación**
```
Dispositivo B (Bob)
1. Esperar 1-2 segundos
2. Verificar que aparece post de Alice en el feed
3. Verificar que dice: "¡Hola desde Alice en el dispositivo A!"
4. Verificar nombre "Alice" y foto
```

**Resultado esperado:**
- ✅ Post aparece en tiempo real (< 2 segundos)
- ✅ Información del autor correcta
- ✅ Timestamp correcto

### Test 2b: Publicación con Imagen

**Paso 1: Bob crea post con imagen**
```
Dispositivo B
1. Click "Crear publicación"
2. Escribir: "Publicación con imagen"
3. Click "Subir Imagen"
4. Seleccionar foto desde dispositivo
5. Click "Publicar"
```

**Paso 2: Alice ve publicación con imagen**
```
Dispositivo A
1. Esperar actualización
2. Verificar que imagen se ve correctamente
3. Hacer click en imagen (debe ampliar)
```

**Resultado esperado:**
- ✅ Imagen sube correctamente
- ✅ Se ve en tiempo real en otro dispositivo
- ✅ Calidad y tamaño correctos

---

## 🧪 Test 3: Comentarios en Tiempo Real 💬

### Objetivo: Verificar interacción de comentarios

**Paso 1: Alice ve post de Bob, comenta**
```
Dispositivo A (Alice)
1. Buscar post de Bob
2. Hacer click en "Comentar"
3. Escribir: "¡Excelente foto Bob!"
4. Click enviar
```

**Paso 2: Bob ve comentario instantáneamente**
```
Dispositivo B (Bob)
1. Encuentra su post
2. Verifica que aparece comentario de Alice
3. Lee: "¡Excelente foto Bob!"
```

**Paso 3: Alice responde**
```
Dispositivo A
1. Bob responde: "¡Gracias Alice!"
2. Click enviar
```

**Paso 4: Bob ve respuesta**
```
Dispositivo B
1. Verifica que aparece respuesta de Bob
2. Total de comentarios actualizado
```

**Resultado esperado:**
- ✅ Comentarios aparecen en < 2 segundos
- ✅ Contador de comentarios actualiza
- ✅ Nombres y fotos correctas
- ✅ Orden cronológico correcto

---

## 🧪 Test 4: Chat Privado en Tiempo Real 💬

### Objetivo: Verificar mensajería privada

**Paso 1: Alice inicia chat con Bob**
```
Dispositivo A (Alice)
1. Click en "Chat"
2. Click en "Iniciar nuevo chat"
3. Buscar "Bob"
4. Click crear chat
```

**Paso 2: Bob ve chat en su lista**
```
Dispositivo B (Bob)
1. Click en "Chat"
2. Verificar que aparece "Alice" en lista de chats
3. Hacer click en Alice
```

**Paso 3: Alice envía mensaje**
```
Dispositivo A
1. Escribir: "Hola Bob, ¿cómo estás?"
2. Click enviar
```

**Paso 4: Bob recibe mensaje instantáneamente**
```
Dispositivo B
1. Esperar 1 segundo
2. Verificar que aparece mensaje: "Hola Bob, ¿cómo estás?"
3. Verificar que dice "Alice" como emisor
4. Ver timestamp
```

**Paso 5: Bob responde**
```
1. Escribir: "¡Hola Alice! Estoy bien, gracias"
2. Click enviar
```

**Paso 6: Alice recibe respuesta**
```
Dispositivo A
1. Verificar que aparece inmediatamente
2. Ver nombre "Bob"
3. Verificar que se marca como leído
```

**Resultado esperado:**
- ✅ Chat aparece en lista al instante
- ✅ Mensajes se sincronizan < 2 segundos
- ✅ Indicador de leído funciona
- ✅ Timestamps correctos
- ✅ Sin duplicados

### Test 4b: Chat con Imagen

**Paso 1: Alice envía imagen**
```
Dispositivo A
1. Hacer click en icono "📎 Imagen"
2. Seleccionar foto
3. Esperar a que suba
4. Verificar que se envía
```

**Paso 2: Bob recibe imagen**
```
Dispositivo B
1. Verificar que aparece imagen en chat
2. Hacer click para ampliar
3. Verificar que se ve correctamente
```

**Resultado esperado:**
- ✅ Imagen se sube correctamente
- ✅ Aparece en tiempo real
- ✅ Se puede ampliar/descargar

---

## 🧪 Test 5: Likes/Reacciones ❤️

### Objetivo: Verificar interacción de likes

**Paso 1: Bob likea post de Alice**
```
Dispositivo B (Bob)
1. Buscar publicación de Alice
2. Hacer click en el ❤️
3. Ver que el contador aumenta
```

**Paso 2: Alice ve el like instantáneamente**
```
Dispositivo A (Alice)
1. Ver su publicación
2. Verificar que contador de likes subió
3. Si hay lista de quienes likearon, ver "Bob"
```

**Paso 3: Alice likea post de Bob**
```
Dispositivo A
1. Encontrar post de Bob
2. Click en ❤️
```

**Paso 4: Bob ve actualización**
```
Dispositivo B
1. Verificar que su post ahora tiene +1 like
2. Ver que "Alice" likeó
```

**Resultado esperado:**
- ✅ Contador actualiza en tiempo real
- ✅ Lista de quienes likearon correcta
- ✅ Interface responde rápido

---

## 🧪 Test 6: Perfil de Otros Usuarios 👤

### Objetivo: Verificar visualización de perfiles

**Paso 1: Alice hace click en perfil de Bob**
```
Dispositivo A (Alice)
1. Encontrar publicación de Bob
2. Hacer click en nombre "Bob" o foto
3. Abrir perfil de Bob
```

**Resultado esperado:**
- ✅ Se abre perfil de Bob sin problemas
- ✅ Se muestran sus datos: programa, trimestre, etc.
- ✅ Se ven sus publicaciones (si hay)

**Paso 2: Bob hace cambios en su perfil**
```
Dispositivo B (Bob)
1. Click en "Perfil"
2. Editar: cambiar bio a "Desarrollador apasionado"
3. Click "Guardar"
```

**Paso 3: Alice ve cambios**
```
Dispositivo A
1. Click "Volver" y abrir perfil de Bob nuevamente
2. Verificar que bio se actualizó
```

**Resultado esperado:**
- ✅ Cambios aparecen al recargar
- ✅ Información sincronizada correctamente

---

## 🧪 Test 7: Sincronización Offline-Online

### Objetivo: Verificar que funciona al reconectar

**Paso 1: Bob "desconecta" (cerrar navegador)**
```
Dispositivo B (Bob)
1. Cerrar pestaña/navegador
2. (Simula desconexión)
```

**Paso 2: Alice sigue interactuando**
```
Dispositivo A (Alice)
1. Crear publicación
2. Comentar en posts
3. Enviar mensajes al chat
```

**Paso 3: Bob se "reconecta"**
```
Dispositivo B
1. Reabrir navegador
2. Ir a: http://192.168.1.100:8080
3. Loguearse como Bob
```

**Resultado esperado:**
- ✅ Todos los cambios se sincronizaron
- ✅ Mensajes de Alice están presente
- ✅ Publicaciones actualizadas
- ✅ No hay duplicados

---

## 🧪 Test 8: Escalabilidad (Opcional)

### Objetivo: Verificar con 3+ dispositivos

**Paso 1: Registrar a Carlos**
```
Dispositivo C (Carlos)
1. Registrarse como: CE | 30000003
2. Loguearse
```

**Paso 2: Todos se comunican**
```
Alice → Comenta en post de Bob
Bob → Envía chat a Alice
Carlos → Comenta en post de Alice
Alice → Ve todo en tiempo real
```

**Resultado esperado:**
- ✅ Sistema escala con 3+ usuarios
- ✅ Sin lag significativo
- ✅ Todos ven cambios

---

## 📊 REPORTE DE RESULTADOS

### Plantilla para documentar

```markdown
## Pruebas Completadas - [FECHA]

### Test 1: Autenticación ✅/❌
- Alice se registró: ✅
- Bob se registró: ✅

### Test 2: Publicaciones ✅/❌
- Alice crea post: ✅
- Bob ve en < 2s: ✅
- Con imagen: ✅

### Test 3: Comentarios ✅/❌
- Comentarios sincronizan: ✅
- Contador actualiza: ✅

### Test 4: Chat ✅/❌
- Chat privado funciona: ✅
- Mensajes en tiempo real: ✅
- Con imágenes: ✅

### Test 5: Likes ✅/❌
- Likes actualizan: ✅

### Test 6: Perfiles ✅/❌
- Ver perfil funciona: ✅
- Ver cambios: ✅

### Test 7: Offline/Online ✅/❌
- Reconexión sincroniza: ✅

### Problemas Encontrados
1. [Problema] - [Solución propuesta]
2. [Problema] - [Solución propuesta]

### Conclusión
✅ Sistema funcionando correctamente
```

---

## 🆘 Problemas Comunes Encontrados

| Problema | Síntoma | Solución |
|----------|---------|----------|
| Mensajes no sincronizan | No aparecen mensajes en otro dispositivo | Verificar conexión a internet, recargar página |
| Imágenes no carga | Imagen sube pero no aparece | Verificar permisos en Storage, conexión |
| Lag alto | Demora > 3 segundos | Revisar ancho de banda, reducir actividad |
| Duplicados | Mismo comentario aparece 2x | Limpiar cache, localStorage.clear() |
| Chat desaparece | No ve el chat después de cerrar | Verificar lista de chats se actualiza |

---

## ✅ ANTES DE DEPLOYER A PRODUCCIÓN

- [ ] Todos los tests pasaron ✅
- [ ] No hay errores en Console
- [ ] Funciona en dispositivos reales (móvil, tablet)
- [ ] Desempeño es aceptable (< 2s sincronización)
- [ ] Imágenes se cargan correctamente
- [ ] Chat es bidireccional
- [ ] Offline/online maneja correctamente
- [ ] README y documentación actualizados

---

## 📱 DISPOSITIVOS RECOMENDADOS PARA PRUEBAS

Usando **múltiples navegadores en el mismo PC:**
- Chrome Dev
- Firefox (diferente usuario)
- Edge
- DevTools modo móvil

**O usar dispositivos reales:**
- Smartphone (WiFi)
- Tablet (WiFi)
- Laptop en segunda red (hotspot)

---

¿Todo funcionó? ¡Felicidades! 🎉 Estás listo para deployer a GitHub Pages.
