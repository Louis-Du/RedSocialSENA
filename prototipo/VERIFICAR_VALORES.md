# Verificar Valores del Perfil

## En el navegador, presiona F12 y ejecuta esto en la consola:

```javascript
// Ver valores actuales de los inputs
const content1 = document.querySelector('#content1');
const inputs = content1.querySelectorAll('input');
const textarea = content1.querySelector('textarea');

console.log('Nombre (input 0):', inputs[0].value);
console.log('Apodo (input 1):', inputs[1].value);
console.log('Bio (textarea):', textarea.value);

// Ver si los elementos están visibles
console.log('content1 visible?', !content1.classList.contains('hidden'));
console.log('content1 display:', window.getComputedStyle(content1).display);
```

## Resultado esperado:

```
Nombre (input 0): Daniel Esteban
Apodo (input 1): Daniel Esteban
Bio (textarea): Aprendiz apasionado por la tecnología
content1 visible? true
content1 display: block
```

## Si ves valores diferentes en pantalla:

Es posible que haya otro script modificando los valores después de cargarlos.

## Si los valores en consola son correctos pero no se ven en pantalla:

Puede ser un problema de tabs o CSS.
