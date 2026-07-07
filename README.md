# Un finde para Irene ✦

Web privada en forma de libro interactivo: una disculpa sincera, una carta y
el plan del fin de semana en Madrid, contado como una pequeña aventura por la
Tierra Media.

Está hecha con HTML, CSS y JavaScript puros. No necesita instalar dependencias:
solo carga tipografías de Google Fonts si hay conexión a internet.

---

## Qué contiene

- Una puerta inicial inspirada en las Puertas de Durin.
- Una contraseña/palabra secreta para abrir el libro.
- Capítulos a pantalla completa, con navegación por flechas, puntos-estrella,
  teclado y gesto de deslizar en móvil.
- Una portada con cuenta atrás hasta la llegada.
- Disculpa, compromiso del finde, mapa de etapas, planes de jueves a domingo,
  sección de fotos, carta sellada y cierre final.
- Efectos suaves: cielo estrellado, partículas, mini-mapas animados y sonido
  opcional tras interacciones.

---

## Cómo verla en tu ordenador

No hace falta instalar nada. Abre una terminal en esta carpeta y ejecuta:

```bash
python3 -m http.server 8000
```

Luego abre en el navegador:

<http://localhost:8000>

También puedes hacer doble clic en `index.html`, pero servirla con el comando
de arriba se parece más a cómo se verá publicada.

---

## Qué puedes personalizar

### 1. Configuración rápida

Está al principio de `script.js`, en el bloque `CONFIG`:

```js
const CONFIG = {
  NOMBRE: "Irene",
  PREGUNTA_SECRETA: "¿Cómo me llamas cuando nadie nos oye?",
  RESPUESTA_SECRETA: ["gatito", "Gatito", "GATITO", "perrito", "Perrito", "PERRITO"],
  MENSAJE_FINAL: "El juramento queda pronunciado. Te espero el jueves ✦",
  FECHA_LLEGADA: "2026-07-09T17:00:00",
  SONIDO: true,
};
```

- `NOMBRE`: nombre grande de la portada.
- `PREGUNTA_SECRETA`: pregunta que aparece en la puerta.
- `RESPUESTA_SECRETA`: palabra o lista de palabras que abren la puerta.
- `MENSAJE_FINAL`: texto que aparece al pulsar el botón final.
- `FECHA_LLEGADA`: fecha y hora objetivo de la cuenta atrás.
- `SONIDO`: `true` activa campanitas suaves; `false` las desactiva.

La respuesta no distingue mayúsculas, tildes ni espacios de sobra: `Gatito`,
`GATITO` y ` gatito ` valen igual. Si hay varias respuestas en la lista, vale
cualquiera de ellas.

### 2. Textos y planes

Los textos están en `index.html`. Las partes editables tienen una marca cerca:

```html
<!-- ✏️ EDITA: ... -->
```

Busca `✏️ EDITA` para ajustar la disculpa, la carta, los títulos, el itinerario
y el cierre. Los horarios de cada día están en elementos con clase
`dia__hora`.

La disculpa y la carta son la parte delicada de la web. Si las cambias, conviene
leerlas en voz alta: tienen que sonar a ti, no a plantilla.

### 3. Colores y estética

La paleta está al principio de `styles.css`, dentro de `:root`:

```css
--noche: #1a1a2e;
--dorado: #e8c47c;
--rosa: #f2b8c6;
```

Cambia esos valores y se actualizan en toda la página. La estética actual es
Tierra Media nocturna: azul noche, dorado, rosa suave e ithildin.

### 4. Fotos

Mete hasta tres fotos en `assets/` con estos nombres exactos:

```text
foto-1.jpg
foto-2.jpg
foto-3.jpg
```

Si falta alguna, aparece un marco bonito en su lugar. Para la versión final,
mejor poner fotos reales o quitar esa sección para que no parezca inacabada.

---

## Checklist antes de enseñarla

- Probar las contraseñas válidas y una variante con espacios de sobra.
- Revisar que `FECHA_LLEGADA` tenga la fecha correcta.
- Comprobar la web en móvil: puerta, capítulos, carta y botón final.
- Decidir si quieres `SONIDO: true` o `SONIDO: false`.
- Confirmar que los planes reales cuadran: horarios, entradas, reservas y
  desplazamientos.
- Añadir fotos reales o eliminar/retocar el capítulo del Libro Rojo.
- Leer la disculpa y la carta una vez sin mirar el código.

---

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube estos archivos.
2. En `Settings → Pages`, elige la rama principal y la carpeta raíz (`/`).
3. En unos minutos tendrás una URL tipo:

```text
https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/
```

### Nota de privacidad

GitHub Pages es público. Cualquiera con la URL puede entrar, y el contenido de
la carta viaja dentro del HTML. La puerta de Durin es un detalle bonito, no una
contraseña real: quien sepa mirar el código fuente puede leerlo todo, respuesta
incluida.

Ten en cuenta esto:

- Usa un nombre de repositorio neutro y poco adivinable, por ejemplo
  `un-finde-2026-a7x`.
- Si el repositorio es público, cualquiera puede leer el código y los textos.
- Las fotos de `assets/` quedan accesibles por URL directa.
- La etiqueta `noindex, nofollow` ayuda a que los buscadores no la indexen, pero
  no protege el contenido.
- Comparte la dirección solo con ella, en privado.
- Cuando pase el finde, puedes despublicar GitHub Pages o borrar el repositorio.

Si prefieres no arriesgarte, enséñasela desde tu propio ordenador con
`python3 -m http.server 8000`, sin publicarla en internet.
