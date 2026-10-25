# Modernización del proyecto — bitácora técnica

Fecha: 2026-08-26
Alcance: actualizar dependencias, herramientas y código legacy a prácticas
actuales, sin poder validar contra MongoDB/MQTT/servidor reales en este entorno.

Este documento explica **qué se hizo, qué se investigó, qué decisiones se
tomaron y por qué (o por qué no)**. No es un README de uso — para eso está
`README.md`.

> **Estado de git**: todos los cambios descritos aquí están en el working
> tree del branch `main`, **sin commitear todavía**. Nada se subió ni se
> desplegó.

---

## TL;DR

- Proyecto congelado en dependencias de ~2023 sobre Node 18 → todo actualizado
  a última versión estable (Express 5, Mongoose 9, TypeScript 5.9, ESLint 9,
  Jest 30, etc.), corriendo sobre Node 22.
- Se descartó explícitamente TypeScript 7.0 (rompe el toolchain) y migrar a
  ESM (mucho *churn* sin beneficio real) — decisión conversada, no asumida.
- El compilador (`tsc`) detectó breaking changes reales de Express 5 (tipos de
  `req.params`) y Mongoose 9 (`_doc` sin tipar), todos corregidos.
- De paso se corrigieron **4 bugs reales** preexistentes (no relacionados con
  las versiones): doble `next()`, `done()` sin `return` en el login, JSON mal
  formado en un publish MQTT, expresiones-sentencia que ESLint moderno marca.
- Segunda ronda, a pedido explícito: validación de env vars al arrancar,
  apagado ordenado (`SIGTERM`/`SIGINT`), `bcrypt` async, `/health`, versión de
  Swagger sincronizada, limpieza de ~19 `try/catch` redundantes que Express 5
  ya no necesita.
- **No se probó contra MongoDB/MQTT/servidor real** — verificado solo con
  `tsc`, `build`, `lint`, `prettier` y carga de tests vía `ts-jest`. Ver
  [Riesgo no verificado](#riesgo-no-verificado) antes de desplegar.
- **Nada está commiteado.** Ver [Próximos pasos](#próximos-pasos).

## Índice

0. [TL;DR](#tldr)
1. [Punto de partida](#1-punto-de-partida)
2. [Investigación previa (qué averigüé)](#2-investigación-previa-qué-averigüé)
3. [Decisiones tomadas (y alternativas descartadas)](#3-decisiones-tomadas-y-alternativas-descartadas)
4. [Qué se actualizó y por qué](#4-qué-se-actualizó-y-por-qué)
5. [Mejoras de la segunda ronda](#5-mejoras-aplicadas-en-la-segunda-ronda-a-pedido-explícito)
6. [Qué NO se hizo, y por qué](#6-qué-no-se-hizo-y-por-qué)
7. [Riesgo no verificado](#riesgo-no-verificado)
8. [Manifiesto final de archivos](#8-manifiesto-final-de-archivos)
9. [Próximos pasos](#próximos-pasos)
10. [Cómo verificar](#10-cómo-verificar-reproducible)

---

## 1. Punto de partida

Proyecto TypeScript/Express (API REST WSN IoT): Mongoose, Passport (JWT +
local), MQTT, Joi, Swagger, Jest. Congelado en dependencias de inicios de 2023
sobre Node 18. La máquina de desarrollo actual corre Node 22.

Antes de tocar nada se leyó el código completo: `app.ts`, `index.ts`,
`config`, `libs/mongoose.ts`, `finalMqtt.ts`, todos los `services`, `models`,
`routes`, `schemas`, `middlewares`, `auth`, tests e2e, `docker-compose.yml`,
el workflow de GitHub Actions y los archivos de configuración de ESLint/Jest/TS.

## 2. Investigación previa (qué averigüé)

- **Versiones instaladas vs. últimas disponibles**: se consultó `npm view <pkg>
  version` para cada dependencia directa y de desarrollo. Resultado: casi todo
  estaba 2-3 majors atrás (Express 4→5, Mongoose 6→9, Helmet 6→8, MQTT 4→5,
  Pino 8→10, Joi 17→18, bcrypt 5→6, TypeScript 4.9→5.9/7.0, Jest 29→30, ESLint
  8→9, ts-node-dev/nodemon sin actividad reciente). Tabla completa en
  [§4.1](#41-tabla-de-versiones-antes--después).
- **TypeScript 7.0**: es el nuevo compilador nativo (Go), todavía no compatible
  con `ts-jest`/el toolchain actual → se descartó explícitamente (ver §3).
- **`eslint-config-standard-with-typescript`**: paquete deprecado, ya no se
  mantiene sobre ESLint 9 (que usa flat config). Se reemplazó por
  `typescript-eslint` (paquete unificado oficial).
- **`.eslintignore`**: formato deprecado en ESLint 9 (flat config usa
  `ignores` dentro de `eslint.config.mjs`). Se encontró que tenía patrones que
  el nuevo config aún no cubría (`html/`, `imgs/`,
  `microcontrolador-raspberry-otros/`) — de no revisarlo se habría perdido esa
  exclusión silenciosamente.
- **Tipos de Express 5 (`@types/express-serve-static-core`)**: `ParamsDictionary`
  cambió de `{ [key: string]: string }` a `{ [key: string]: string | string[] }`
  para soportar parámetros repetidos de `path-to-regexp` v8. Esto rompió la
  compilación en 10 sitios donde se desestructuraba `req.params` (los
  detecté leyendo la salida real de `tsc`, no por sospecha).
- **Express 5 cambió el parser de query string por defecto** de `extended`
  (librería `qs`, soporta `?a[b]=1`) a `simple` (`querystring` nativo de
  Node, solo pares planos). No rompió nada porque el proyecto solo lee
  `req.query.limit/offset/date` (valores planos), pero es un cambio de
  comportamiento real que no se detecta con `tsc` — se documenta para que
  quede visible (ver [Riesgo no verificado](#riesgo-no-verificado)).
- **`ts-jest` con tipos de `package.json`**: al importar `package.json` con
  `import { version } from '../package.json'` (habilitado por
  `resolveJsonModule`), `tsc` copia el archivo completo a `dist/`, generando
  colisión con el "haste map" de Jest (`Haste module naming collision:
  iot-ts`). Esto lo detecté corriendo `npx jest --listTests` como parte de la
  verificación, no era evidente de antemano — se solucionó con `require()`
  runtime en vez de `import` estático.
- **`typescript@^5.9.4` no existe** (el último parche real es `5.9.3`): lo
  detectó `npm install` al fallar la resolución de dependencias. Se corrigió
  el rango en `package.json`.
- **Comportamiento de Express 5 con promesas rechazadas**: confirmado en las
  release notes oficiales — un handler `async` que lanza o rechaza se reenvía
  solo a `next(err)`. Esto volvió innecesarios ~19 bloques `try/catch { next
  (error) }` repetidos en los routers.

## 3. Decisiones tomadas (y alternativas descartadas)

Estas se le presentaron al usuario antes de ejecutar, vía preguntas
explícitas, porque bifurcaban el plan:

| Decisión | Elegido | Alternativa descartada | Por qué |
|---|---|---|---|
| Versión de TypeScript | **5.9** | 7.0 (nativo) | 7.0 es el compilador nuevo experimental; rompe `ts-jest`/`tsx` hoy. Habría dejado el proyecto "actualizado" pero no funcional — contradice el pedido explícito de que el código sea funcional. |
| Sistema de módulos | **CommonJS** (sin cambios) | Migrar a ESM | ESM en este proyecto obliga a tocar imports, `__dirname`, la config de Jest y el `require('./auth')` legacy — mucho *churn* sin beneficio funcional real para una API Express clásica. CommonJS sigue siendo válido y estándar. |
| Riesgo en majors sin poder probar runtime (Express 5, Mongoose 9) | **Ir a las últimas y verificar por `tsc` + lint** | Quedarse en Mongoose 8 (más "rodado") | El usuario pidió explícitamente llegar a lo último. Se mitigó el riesgo verificando exhaustivamente con el compilador (que atrapó los cambios de tipos reales) en vez de solo "instalar y confiar". |

Otras decisiones menores, tomadas por criterio propio (no bifurcaban el plan
lo suficiente como para preguntar):

- **`ts-node-dev` / `nodemon` → `tsx`**: ambos paquetes llevan tiempo sin
  releases activos; `tsx` es el reemplazo de facto mantenido activamente para
  correr TS directo en dev.
- **`mongodb` como dependencia directa → eliminada**: Mongoose ya trae su
  propio driver de MongoDB; era una dependencia sin uso directo en el código
  (`grep` no encontró ningún `require('mongodb')`/`import from 'mongodb'`
  fuera de Mongoose mismo).
- **Cast `req.params as { id: string }` en vez de tipar cada handler con
  generics de Express** (`Request<{ id: string }>`): con la validación de Joi
  ya garantizando que el parámetro es un string simple en tiempo de
  ejecución, el cast es seguro y es un diff mínimo. Tipar cada handler con
  genéricos habría sido más "correcto" en un sentido académico pero es mucho
  más ruido para el mismo resultado práctico — no se justificaba.

## 4. Qué se actualizó y por qué

### 4.1 Tabla de versiones (antes → después)

**Dependencias de producción**

| Paquete | Antes | Después |
|---|---|---|
| express | ^4.18.2 | ^5.2.1 |
| mongoose | ^6.8.4 | ^9.9.4 |
| helmet | ^6.0.1 | ^8.3.0 |
| mqtt | ^4.3.7 | ^5.15.2 |
| pino | ^8.11.0 | ^10.3.1 |
| pino-pretty | ^9.4.0 | ^13.1.3 |
| joi | ^17.7.0 | ^18.2.5 |
| bcrypt | ^5.1.0 | ^6.0.0 |
| dotenv | ^16.0.3 | ^17.4.2 |
| cors | ^2.8.5 | ^2.8.6 |
| morgan | ^1.10.0 | ^1.11.0 |
| jsonwebtoken | ^9.0.0 | ^9.0.3 |
| passport | ^0.6.0 | ^0.7.0 |
| swagger-ui-express | ^4.6.0 | ^5.0.1 |
| swagger-jsdoc | ^6.2.8 | ^6.3.0 |
| @hapi/boom | ^10.0.0 | ^10.0.1 |
| mongodb | ^4.13.0 | **eliminado** |

**Dependencias de desarrollo**

| Paquete | Antes | Después |
|---|---|---|
| typescript | ^4.9.4 | ^5.9.3 |
| jest | ^29.4.3 | ^30.4.2 |
| ts-jest | ^29.0.5 | ^29.4.12 |
| supertest | ^6.3.3 | ^7.2.2 |
| eslint | ^8.34.0 | ^9.18.0 |
| prettier | ^2.8.3 | ^3.9.6 |
| eslint-config-prettier | ^8.6.0 | ^10.1.8 |
| eslint-plugin-jest | ^27.2.1 | ^29.16.2 |
| @types/node | ^18.11.18 | ^22.10.5 |
| @types/express | ^4.17.15 | ^5.0.6 |
| @types/jest | ^29.4.0 | ^30.0.0 |
| @types/supertest | ^2.0.12 | ^7.2.1 |
| @types/bcrypt | ^5.0.0 | ^6.0.0 |
| ts-node-dev, nodemon | ^2.0.0, ^2.0.20 | **eliminados** → `tsx` ^4.23.12 |
| eslint-config-standard-with-typescript, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, eslint-plugin-import, eslint-plugin-n, eslint-plugin-promise, eslint-plugin-prettier | (ESLint 8) | **eliminados** → `typescript-eslint` ^8.68.0 + `@eslint/js` ^9.18.0 |

*(El resto de `@types/*` menores — cors, jsonwebtoken, morgan, passport,
passport-jwt, passport-local, swagger-jsdoc, swagger-ui-express — se
actualizaron a su última versión sin cambios de major relevantes.)*

### Dependencias (`package.json`)
Todas las dependencias directas y de desarrollo se subieron a su última
versión estable disponible en npm.

**Eliminado, con motivo:**
- `mongodb` — dependencia directa sin uso (Mongoose la trae transitivamente).
- `ts-node-dev`, `nodemon` — reemplazados por `tsx` (mantenido).
- `eslint-config-standard-with-typescript`, `@typescript-eslint/eslint-plugin`,
  `@typescript-eslint/parser`, `eslint-plugin-import`, `eslint-plugin-n`,
  `eslint-plugin-promise`, `eslint-plugin-prettier` — todo el stack viejo de
  ESLint 8 basado en `.eslintrc`, incompatible con flat config de ESLint 9.
  `typescript-eslint` (paquete unificado) cubre el mismo rol.
- `"main": "src/index.js"` — campo muerto, apuntaba a un archivo que nunca
  existió (el build compila a `dist/`); el proyecto es una app, no una
  librería que otros paquetes vayan a `require()`.

### Herramientas de proyecto
- **`.eslintrc.js` + `.eslintignore` → `eslint.config.mjs`** (flat config,
  obligatorio desde ESLint 9). Se preservaron las mismas relajaciones de
  reglas que el código necesitaba (`no-explicit-any: off`,
  `no-misused-promises: off`, etc.) y se migraron los patrones de ignore que
  tenía el `.eslintignore` viejo (antes se habrían perdido silenciosamente).
- **`tsconfig.json`**: reescrito limpio (`target: es2022`, sin el muro de
  comentarios que traía por defecto el scaffold de TS), mismas garantías de
  `strict`.
- **`.nvmrc`** (nuevo) con `22`, alineado a `engines.node` en `package.json`.

### Infraestructura
- **`.github/workflows/main_api-rest-wsn-iot-gc.yml`**: `actions/checkout@v2`
  → `@v4`, `actions/setup-node@v1` → `@v4` (Node 22.x + cache npm),
  `upload/download-artifact@v2` → `@v4` (v2 fue apagado por GitHub en 2024,
  este workflow habría empezado a fallar solo con el tiempo),
  `azure/webapps-deploy@v2` → `@v3`. Cambio de `npm install` a `npm ci` para
  builds reproducibles en CI.
- **`docker-compose.yml`**: quitado el campo `version:` (obsoleto en Compose
  v2), `mongo:5.0.3` → `mongo:8`, `emqx/emqx:4.3.11` → `emqx/emqx:5.8.4`. No
  se levantó el compose (fuera del alcance acordado), solo se actualizaron las
  imágenes referenciadas.

### Código — adaptación a breaking changes reales
- **`src/libs/mongoose.ts`**: `mongoose.set('strictQuery', false)` movido
  *antes* de `connect()` (antes estaba después, lo cual no tenía efecto en
  Mongoose 6 pero es incorrecto formalmente); se quitaron las opciones de
  conexión legacy comentadas (`useNewUrlParser`/`useUnifiedTopology`, no
  existen desde el driver 4).
- **`_doc` → `.toObject()`** en `user.service.ts` (método `create`) y
  `auth/strategies/local.ts`: `_doc` es una propiedad interna no tipada de
  Mongoose; con tipos más estrictos en Mongoose 9 dejó de compilar sin `any`.
  `.toObject()` es la API pública soportada para el mismo propósito.
- **`req.params` con cast explícito** en los 5 routers (`nodes`, `sensors`,
  `users`, `data` + los de `/data` anidados en `sensors.router.ts`): por el
  cambio de tipo de `ParamsDictionary` en Express 5 explicado en §2.
- **`passport-jwt`**: tipado explícito del `verify` callback
  (`VerifyCallback`) y `secretOrKey: config.jwtSecret` sin `!` (ya no hace
  falta el non-null assertion porque `config` ahora garantiza el valor —
  ver punto de validación de env vars más abajo).
- **`src/app.ts`**: `require('./auth')` (import dinámico legacy dentro del
  cuerpo de la función) → `import './auth'` estático arriba del archivo, para
  consistencia con el resto de imports y porque no había ninguna razón
  (condicional, lazy-loading) que justificara el `require` dinámico.

### Bugs reales corregidos (no solo "actualización")
Estos no son parte de "modernizar dependencias" sino defectos que aparecieron
al leer el código con atención:

- **`validator.handler.ts`**: tras `next(boom.badRequest(...))` el código
  seguía y llamaba `next()` una segunda vez sin argumentos — doble
  invocación de `next` en el mismo request. Se agregó `return`.
- **`auth/strategies/local.ts`**: en las ramas de `done(err, false)` faltaba
  `return`, así que tras reportar "no autorizado" o "password inválido" la
  función seguía ejecutando el resto del callback (podía llegar a comparar
  password de un `user` inexistente y lanzar una excepción no controlada, o
  en el peor caso continuar hacia el `done(null, ...)` final). Se agregó
  `return` en cada rama.
- **`finalMqtt.ts`**: el publish de error mandaba un JSON manualmente armado
  y mal formado (`` `{"error": "${topic}"` `` — sin la llave de cierre ni el
  segundo `"`). Se corrigió a `JSON.stringify({ error: topic })`. También se
  reemplazaron `console.log` sueltos por el `logger` (pino) ya usado en el
  resto del proyecto, y se tipó `message` como `Buffer` en vez de `any`.
- **`middlewares/auth.handler.ts` y `services/sensor.service.ts`**: usaban un
  ternario (`cond ? next() : next(err)`) y un `&&` (`sensor && (await
  publishChanges(...))`) como sentencias completas — funcionan pero ESLint
  moderno los marca (`no-unused-expressions`) porque el valor de retorno se
  descarta a propósito, lo cual suele ser señal de un error de tipeo en otros
  contextos. Se reescribieron como `if/else` explícitos.

## 5. Mejoras aplicadas en la segunda ronda (a pedido explícito)

Después de la modernización, se hizo una revisión adicional del código y se
propusieron 7 mejoras concretas (no especulativas) — el usuario pidió
aplicarlas todas:

1. **Validación de env vars al arrancar** (`config/index.ts`): si falta
   `JWT_SECRET` o `DB_URI`, la app ahora lanza un error inmediato y legible al
   iniciar. Antes fallaba tarde y de forma confusa: recién en el primer
   intento de login (`passport-jwt` lanzaba `"JwtStrategy requires a secret
   or key"` desde dentro de una librería externa) — se confirmó este
   comportamiento real corriendo `npx jest test/e2e/app.test.ts` durante la
   verificación.
2. **Apagado ordenado** (`index.ts` + `finalMqtt.ts`): maneja `SIGTERM`/
   `SIGINT`, cierra el servidor HTTP, desconecta MQTT y luego Mongo antes de
   salir con `process.exit(0)`. Relevante porque el proyecto se despliega en
   Azure App Service, donde cada redeploy manda estas señales.
3. **`bcrypt.hashSync` → `bcrypt.hash` (async)** en `user.service.ts`:
   `hashSync` bloquea el event loop completo de Node mientras calcula el
   hash (costoso a propósito, por diseño de bcrypt) — en una API con más de
   un usuario concurrente esto degrada todas las requests en vuelo, no solo
   la del registro. Se aprovechó el cambio para corregir también el typo
   `brcypt` → `bcrypt` en los imports de ese archivo.
4. **Versión de Swagger sincronizada con `package.json`**: estaba hardcodeada
   en `'1.1.0'`, desactualizada frente al `2.0.0` real del proyecto. Se leyó
   dinámicamente. *Nota de por qué `require()` y no `import`*: usar `import {
   version } from '../package.json'` hacía que `tsc` copiara el
   `package.json` completo a `dist/`, lo cual colisionaba con el resolutor de
   módulos de Jest (`Haste module naming collision`) — se detectó en la
   verificación final y se resolvió usando `require()` en tiempo de
   ejecución (con `eslint-disable-next-line` puntual, justificado con
   comentario en el propio archivo).
5. **`package.json.main` eliminado**: ver §4.
6. **Endpoint `/health`**: agregado en `app.ts`, sin autenticación, para que
   un balanceador/monitor de Azure pueda chequear liveness sin pasar por
   Passport ni por Mongo.
7. **Boilerplate `try/catch` eliminado en ~19 handlers async** de los 5
   routers: con Express 5, un handler `async` que rechaza su promesa se
   reenvía automáticamente a `next(err)` (confirmado en las release notes
   oficiales de Express 5, no es una suposición). El patrón `try { ... }
   catch (error) { next(error) }` repetido en cada endpoint ya no aporta
   nada — se simplificó a `await` directo, reduciendo el ruido visual y el
   tamaño de cada handler.

## 6. Qué NO se hizo, y por qué

- **No se migró a ESM** — decisión explícita del usuario, ver §3.
- **No se usó TypeScript 7.0** — decisión explícita del usuario, ver §3.
- **No se levantó Docker/Mongo/MQTT ni el servidor** — fuera del alcance
  pedido ("no es necesario que compruebes inicializando docker mqtt ni las
  raspberry, ni inicializando el servidor"). La verificación se hizo con
  `tsc --noEmit`, `npm run build`, `npm run lint`, `prettier --check` y
  `jest --listTests` (para confirmar que los tests al menos cargan/transpilan
  con `ts-jest`). Correr los tests e2e reales requiere una instancia de
  MongoDB con `.env`/`.env.e2e` poblados, que no existen en este entorno.
- **No se generalizaron los tipos de `req.params` con genéricos de Express**
  — ver tabla de decisiones menores en §3 (costo/beneficio no lo justificaba
  frente al cast puntual).
- **No se tocó el import `brcypt` en `test/utils/seed.ts` ni en
  `test/e2e/users.test.ts`** — quedó fuera del `tsconfig.json` (la carpeta
  `test/` está explícitamente excluida) y fuera del alcance de "código de
  producción"; corregirlo no cambia ningún comportamiento compilado.
- **No se agregó rate limiting, CSP custom de Helmet, ni configuración de
  CORS restringida a un origen** — son cambios de postura de seguridad, no de
  modernización de código legacy; requieren una decisión de producto (qué
  orígenes permitir, qué límites de tasa) que no estaba en el pedido
  original. Se puede evaluar como siguiente paso si se desea.

## Riesgo no verificado

Todo lo que sigue compila, lintea y formatea limpio, pero **no se ejecutó
contra servicios reales**. Antes de dar por cerrado el upgrade en un entorno
con Mongo/MQTT reales, priorizar revisar esto en este orden:

1. **Conexión y queries reales a Mongoose 9** — el compilador solo valida
   tipos, no comportamiento. Verificar en particular los `populate()` con
   virtuals anidados (`user → nodes → sensors`, `node → sensors`), que son la
   parte más "no trivial" del esquema y no cambiaron de sintaxis pero sí
   podrían cambiar de comportamiento entre majors.
2. **Parser de query string de Express 5** (`extended` → `simple`, ver §2) —
   confirmado que el código actual solo usa query params planos, pero si en
   el futuro se agrega algún filtro anidado (`?filter[x]=y`), dejará de
   funcionar como antes silenciosamente.
3. **`bcrypt` nativo (bindings compilados)** — el bump a v6 recompila el
   módulo nativo en `npm install`. Se instaló y compiló sin problemas en
   macOS/Node 22 local; **no se confirmó en el target real de despliegue**
   (Azure App Service Linux). Si el pipeline de CI falla en el paso de
   `npm ci`, es el primer sospechoso.
4. **Reconexión MQTT (mqtt v5)** — la lógica manual de reintentos en
   `finalMqtt.ts` no cambió, pero mqtt v5 trae su propio manejo de
   reconexión con defaults distintos a v4. No se pudo probar contra un
   broker real.
5. **Passport JWT/local end-to-end** — se confirmó que la app *arranca* y
   valida env vars correctamente (`npx jest test/e2e/app.test.ts` mostró el
   fail-fast esperado por falta de `.env`), pero el flujo completo de login +
   token + rutas protegidas no se ejecutó de punta a punta.

## 8. Manifiesto final de archivos

Checklist rápido de todo lo tocado, sin necesidad de leer el resto del
documento. Generado desde `git status --short` al cierre del trabajo.

**Creados**
- [x] `.nvmrc`
- [x] `eslint.config.mjs`
- [x] `MODERNIZATION.md` (este documento)

**Borrados**
- [x] `.eslintrc.js` — reemplazado por `eslint.config.mjs`
- [x] `.eslintignore` — reemplazado por `ignores` dentro del flat config

**Modificados — configuración e infraestructura**
- [x] `package.json`
- [x] `package-lock.json`
- [x] `tsconfig.json`
- [x] `jest.config.js`
- [x] `.prettierignore`
- [x] `docker-compose.yml`
- [x] `.github/workflows/main_api-rest-wsn-iot-gc.yml`
- [x] `README.md`

**Modificados — código fuente (`src/`)**
- [x] `src/app.ts`
- [x] `src/index.ts`
- [x] `src/config/index.ts`
- [x] `src/swagger.options.ts`
- [x] `src/finalMqtt.ts`
- [x] `src/libs/mongoose.ts`
- [x] `src/auth/strategies/jwt.ts`
- [x] `src/auth/strategies/local.ts`
- [x] `src/middlewares/auth.handler.ts`
- [x] `src/middlewares/error.handler.ts`
- [x] `src/middlewares/validator.handler.ts`
- [x] `src/routes/auth.router.ts`
- [x] `src/routes/data.router.ts`
- [x] `src/routes/nodes.router.ts`
- [x] `src/routes/sensors.router.ts`
- [x] `src/routes/users.router.ts`
- [x] `src/services/data.service.ts`
- [x] `src/services/sensor.service.ts`
- [x] `src/services/user.service.ts`

**No tocados intencionalmente**
- `test/**` (fuera de `tsconfig.json`, incluye el typo `brcypt` sin corregir — ver §6)
- `src/schemas/**`, `src/libs/models/**` — sin breaking changes que los afectaran
- `.env.example` — no requería cambios de forma

Total: 3 creados, 2 borrados, 27 modificados.

## Próximos pasos

1. **Commitear los cambios.** Nada de esto está en el historial de git
   todavía — está solo en el working tree local.
2. **Levantar `docker-compose.yml` y correr `npm run e2e`** con `.env.e2e`
   poblado, para validar contra Mongo real lo que aquí solo se validó por
   tipos (ver [Riesgo no verificado](#riesgo-no-verificado)).
3. **Probar el flujo MQTT** contra un broker EMQX real (publish/subscribe +
   reconexión), no solo revisión estática del código.
4. **Confirmar que `npm ci` compila `bcrypt` sin problemas en el target de
   despliegue real** (Azure App Service Linux), no solo en local.
5. **Decidir la postura de seguridad pendiente**: origen(es) permitido(s) en
   CORS, si hace falta rate limiting, si se ajusta el CSP por defecto de
   Helmet. Quedó fuera de este alcance a propósito (ver §6) porque son
   decisiones de producto, no de modernización.
6. **Opcional**: si el equipo prefiere tipado estricto de rutas en vez del
   cast puntual de `req.params`, migrar a `Request<{ id: string }>` por
   handler (se evaluó y se descartó por ahora, ver §3).
7. Una vez validado en un entorno real, actualizar `README.md` si cambia
   algún comando o requisito de versión de Node/Docker documentado ahí.

## 10. Cómo verificar (reproducible)

```bash
npm install
npx tsc --noEmit   # chequeo de tipos puro
npm run build      # compila a dist/
npm run lint       # eslint.config.mjs (flat config, ESLint 9)
npx prettier --check .
npx jest --listTests   # confirma que ts-jest carga/transpila los tests
```

Los tests e2e (`npm run e2e`) requieren MongoDB accesible vía `DB_URI` en
`.env.e2e` y no se ejecutaron en este entorno por decisión acordada con el
usuario.

## 11. Actualización 2026-10: pnpm + Node 24 LTS

Segunda etapa, hecha antes de publicar en GitHub (rama `modernizacion-2026`).

**Gestor de paquetes: npm → pnpm**
- Se eliminó `package-lock.json` y se generó `pnpm-lock.yaml`.
- `package.json` declara `"packageManager": "pnpm@12.15.0"` (con
  `corepack enable` se usa la versión exacta).
- `pnpm-workspace.yaml` → `allowBuilds`: pnpm no ejecuta scripts de
  instalación por defecto. Se permiten solo `bcrypt` (binario nativo) y
  `esbuild` (usado por `tsx`); se niegan `@scarf/scarf` (telemetría),
  `@parcel/watcher` y `unrs-resolver` (no hacen falta: traen binarios
  precompilados o son opcionales).
- Script `lint:fix` pasa a `eslint . --fix` (antes usaba `npm run`).
- CI: `pnpm/action-setup@v4` + `actions/setup-node@v4` con `cache: pnpm`,
  `pnpm install --frozen-lockfile --config.node-linker=hoisted` y
  `pnpm build`. `node-linker=hoisted` genera un `node_modules` plano (sin
  symlinks) para que el artefacto que se sube a Azure App Service se
  comporte igual que con npm. Se quitó `package-lock-path` del paso de deploy.
- README y `.prettierignore` actualizados a pnpm.

**Runtime: Node 22 → Node 24 LTS**
- `.nvmrc` → `24`, `engines.node` → `>=24`, `@types/node` → `^24`.
- CI: `node-version: "24.x"`. `docker-compose.yml` no usa imagen de Node
  (solo EMQX y MongoDB) y no hay `Dockerfile`, así que no hubo más cambios.
- **Pendiente fuera del repo:** configurar el runtime del App Service de
  Azure en Node 24 LTS.

**Bug corregido: `Cannot find module '../package.json'` en producción**
- `src/swagger.options.ts` hacía `require('../package.json')`, que funciona
  con `tsx` desde `src/` pero falla al ejecutar `dist/src/index.js`
  (`pnpm start`): la app no arrancaba. Ahora busca `package.json` subiendo
  directorios desde `__dirname`, y funciona en ambos casos.

**Verificación (Node 24.22, pnpm 12.15)**
- `pnpm install`, `pnpm exec tsc --noEmit`, `pnpm build` y `pnpm lint`: OK.
- Prueba de humo con `pnpm build && pnpm start` contra MongoDB 8 en Docker:
  `/health` 200, `/docs` 200, login 404 con usuario inexistente, login OK
  con un admin creado a mano (token JWT), `GET /users` y `GET /nodes`
  autenticados 200, y 401 sin token.
- Tests e2e de Jest: **fallan por infraestructura de test, no por la app.**
  Dentro de Jest, el driver de MongoDB rechaza la conexión con
  `Missing required sub-document 'driver' in the client metadata document`
  (el mismo `mongoose.connect` funciona fuera de Jest). Solo pasa
  `GET /` → 200. Queda pendiente ajustar el entorno de Jest para el driver
  de MongoDB 7.
- MQTT no se probó contra un broker real.

```bash
corepack enable        # o tener pnpm instalado
pnpm install
pnpm build && pnpm lint
pnpm e2e               # requiere MongoDB (docker compose up -d mongo-e2e) y .env.e2e
```
