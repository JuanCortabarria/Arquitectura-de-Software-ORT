# 🧪 GUÍA COMPLETA: TESTING PARTE 4 - PERSISTENCIA Y GESTIÓN DE DATOS

**Documento:** Testing Crypto Portfolio API - Parte 4  
**Versión:** 1.0  
**Fecha:** Abril 2026  

---

## 📋 TABLA DE CONTENIDOS

1. [Prerequisitos](#prerequisitos)
2. [Paso 0: Verificar Prerequisitos](#paso-0-verificar-prerequisitos)
3. [Paso 1: Instalar Dependencias](#paso-1-instalar-dependencias)
4. [Paso 2: Compilar TypeScript](#paso-2-compilar-typescript)
5. [Paso 3: Levantar Servicios con Docker Compose](#paso-3-levantar-servicios-con-docker-compose)
6. [Paso 4: Verificar Servicios Activos](#paso-4-verificar-servicios-activos)
7. [Paso 5: Probar API con Postman](#paso-5-probar-api-con-postman)
8. [Paso 6: Verificar Persistencia](#paso-6-verificar-persistencia)
9. [Paso 7: Probar Graceful Shutdown](#paso-7-probar-graceful-shutdown)
10. [Paso 8: Ejecutar Tests](#paso-8-ejecutar-tests)
11. [Checklist de Verificación](#checklist-de-verificación)
12. [Troubleshooting](#troubleshooting)

---

## 📦 PREREQUISITOS

Antes de empezar, asegúrate que tienes instalado:

- **Docker Desktop** (incluye Docker y Docker Compose)
- **Node.js** >= v18
- **npm** (incluido con Node.js)
- **Postman** (opcional pero recomendado)
- **macOS, Linux o Windows con WSL2**

---

## PASO 0: VERIFICAR PREREQUISITOS

Abre una terminal y ejecuta:

### Verificar Docker
```bash
docker --version
```

**Resultado esperado:**
```
Docker version 27.0.0, build c9ea2c9
```

Si no está instalado, descarga desde: https://www.docker.com/products/docker-desktop

### Verificar Docker Compose
```bash
docker compose version
```

**Resultado esperado:**
```
Docker Compose version v2.27.0
```

### Verificar Node.js
```bash
node --version
npm --version
```

**Resultado esperado:**
```
v20.11.0
10.5.0
```

Si falta Node.js, descarga desde: https://nodejs.org/ (versión LTS)

---

## PASO 1: INSTALAR DEPENDENCIAS

### 1.1 - Navegar a la carpeta del proyecto

```bash
cd "/Users/juancortabarria/Documents/Arquitectura Software/Arquitectura-de-Software-ORT/crypto-portfolio-api"
```

### 1.2 - Limpiar instalaciones previas (opcional)

```bash
rm -rf node_modules package-lock.json
```

### 1.3 - Instalar todas las dependencias

```bash
npm install
```

**Espera 3-5 minutos.** Verás output como:
```
added 500+ packages, and audited 650 packages in 3m45s
```

### 1.4 - Verificar que instalaron Sequelize, Mongoose y mysql2

```bash
npm list sequelize mongoose mysql2
```

**Resultado esperado:**
```
├── mongoose@9.4.1
├── mysql2@3.22.0
└── sequelize@6.37.8
```

✅ **Si ves las 3 versiones, estás listo para el siguiente paso**

---

## PASO 2: COMPILAR TYPESCRIPT

### 2.1 - Compilar el código

```bash
npm run build
```

**Resultado esperado:**
```
# Sin errores, terminal termina normalmente
```

### 2.2 - Verificar que se creó la carpeta dist/

```bash
ls -la dist/
```

**Resultado esperado:**
```
total 256
drwxr-xr-x   20 juancortabarria  staff      640 Apr 16 13:00 dist/
-rw-r--r--    1 juancortabarria  staff     2548 Apr 16 13:00 index.js
-rw-r--r--    1 juancortabarria  staff     1245 Apr 16 13:00 app.js
drwxr-xr-x    1 juancortabarria  staff      320 Apr 16 13:00 config/
drwxr-xr-x    1 juancortabarria  staff      320 Apr 16 13:00 controllers/
... (más archivos)
```

✅ **Si ves archivos .js compilados, la compilación fue exitosa**

---

## PASO 3: LEVANTAR SERVICIOS CON DOCKER COMPOSE

**⚠️ IMPORTANTE:** Este paso levanta 3 servicios que corren en paralelo.

### 3.1 - Levantar Docker Compose

```bash
docker compose up
```

**Espera 20-30 segundos.** Verás logs de los 3 servicios:

```
mysql      | WARNING: no logs are available with the 'json-file' log driver
mysql      | [MySQL] Server started, waiting for connections...

mongodb    | [MongoDB] Waiting for connections on port 27017

api        | MySQL conectado correctamente
api        | Modelos de Sequelize sincronizados
api        | MongoDB conectado correctamente
api        | Servidor corriendo en http://localhost:4000
api        | API externa: https://min-api.cryptocompare.com/data/price
```

✅ **Si ves estos 4 mensajes, Docker Compose está funcionando correctamente**

**⚠️ IMPORTANTE:** Deja este terminal abierto y corriendo. Los logs continuarán mostrando actividad.

---

## PASO 4: VERIFICAR SERVICIOS ACTIVOS

**Abre un NUEVO terminal** (no cierres el anterior donde corre docker compose).

### 4.1 - Listar contenedores activos

```bash
docker ps
```

**Resultado esperado:**
```
CONTAINER ID   IMAGE                  STATUS         PORTS
abc123...      crypto-portfolio-api   Up 2 minutes   0.0.0.0:4000->4000/tcp
def456...      mysql:8.0              Up 2 minutes   0.0.0.0:3306->3306/tcp
ghi789...      mongo:7                Up 2 minutes   0.0.0.0:27017->27017/tcp
```

✅ **Si ves 3 contenedores, todos los servicios están activos**

### 4.2 - Verificar que la API está respondiendo

```bash
curl http://localhost:4000/assets
```

**Resultado esperado:**
```json
[]
```

✅ **Un array vacío significa que la API está activa y conectada a MySQL**

---

## PASO 5: PROBAR API CON POSTMAN

### 5.1 - Instalar Postman (si no lo tienes)

1. Ve a: https://www.postman.com/downloads/
2. Descarga la versión para macOS
3. Abre el archivo `.dmg` descargado
4. Arrastra el icono de Postman a la carpeta Applications
5. Abre Postman (busca en Spotlight: Cmd+Space → "Postman")

### 5.2 - Importar la Collection

La collection ya viene incluida en el proyecto: `Crypto Portfolio - Parte 4.postman_collection.json`

**Para importarla:**

1. Abre Postman
2. Haz click en **Import** (botón arriba a la izquierda)
3. Selecciona **Upload Files**
4. Navega a: `/Users/juancortabarria/Documents/Arquitectura Software/Arquitectura-de-Software-ORT/crypto-portfolio-api/`
5. Selecciona: `Crypto Portfolio - Parte 4.postman_collection.json`
6. Haz click en **Open**
7. Haz click en **Import**

**Verás la collection en el panel izquierdo con estos requests:**
```
Crypto Portfolio - Parte 4
  ├── Create Bitcoin
  ├── Create Ethereum
  ├── Get All Assets
  ├── Get Bitcoin by ID
  ├── Update Bitcoin Quantity
  ├── Get Bitcoin History
  └── Delete Bitcoin
```

### 5.3 - Configurar Variables de Entorno en Postman

**Esto es IMPORTANTE** para que los requests funcionen con URLs dinámicas.

1. Haz click en el **engranaje** (⚙️) arriba a la derecha
2. Selecciona **Environments**
3. Haz click en **Create**
4. **Name:** `Crypto Portfolio Local`
5. Agrega estas variables:

| Variable | Inicial | Actual |
|---|---|---|
| `baseURL` | `http://localhost:4000` | `http://localhost:4000` |
| `btcId` | (dejar vacío) | (se actualizará después) |
| `ethId` | (dejar vacío) | (se actualizará después) |

6. Haz click en **Save**
7. En Postman, selecciona el environment: **Crypto Portfolio Local** (dropdown arriba a la derecha)

---

### 5.4 - Ejecutar los Requests en Orden

#### **Request 1: Create Bitcoin**

1. Haz click en **Create Bitcoin** (de la collection)
2. Verifica que está en **POST** y la URL sea `{{baseURL}}/assets`
3. Body debe mostrar:
```json
{
  "symbol": "BTC",
  "name": "Bitcoin",
  "quantity": 0.5,
  "purchasePrice": 45000
}
```
4. Haz click en **Send**

**Resultado esperado (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "symbol": "BTC",
  "name": "Bitcoin",
  "quantity": 0.5,
  "purchasePrice": 45000
}
```

✅ **Copia el `id` y guárdalo temporalmente**

---

#### **Request 2: Create Ethereum**

1. Haz click en **Create Ethereum**
2. Haz click en **Send**

**Resultado esperado (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "symbol": "ETH",
  "name": "Ethereum",
  "quantity": 2.5,
  "purchasePrice": 2500
}
```

✅ **Copia este `id` también**

---

#### **Request 3: Get All Assets**

1. Haz click en **Get All Assets**
2. Método debe ser **GET**
3. Haz click en **Send**

**Resultado esperado (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "symbol": "BTC",
    "name": "Bitcoin",
    "quantity": 0.5,
    "purchasePrice": 45000
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "symbol": "ETH",
    "name": "Ethereum",
    "quantity": 2.5,
    "purchasePrice": 2500
  }
]
```

✅ **Ambos activos están persistidos en MySQL**

---

#### **Request 4: Get Bitcoin by ID**

1. Haz click en **Get Bitcoin by ID**
2. La URL debe ser: `{{baseURL}}/assets/550e8400-e29b-41d4-a716-446655440000`
   - ⚠️ **Reemplaza con el ID de Bitcoin que copiaste**
3. Haz click en **Send**

**Resultado esperado (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "symbol": "BTC",
  "name": "Bitcoin",
  "quantity": 0.5,
  "purchasePrice": 45000
}
```

✅ **GET por ID funciona correctamente**

---

#### **Request 5: Update Bitcoin Quantity**

1. Haz click en **Update Bitcoin Quantity**
2. Método debe ser **PUT**
3. URL: `{{baseURL}}/assets/550e8400-e29b-41d4-a716-446655440000`
   - ⚠️ **Reemplaza con el ID de Bitcoin**
4. Body (raw JSON):
```json
{
  "quantity": 1.5
}
```
5. Haz click en **Send**

**Resultado esperado (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "symbol": "BTC",
  "name": "Bitcoin",
  "quantity": 1.5,
  "purchasePrice": 45000
}
```

✅ **La cantidad cambió de 0.5 a 1.5**

---

#### **Request 6: Get Bitcoin History** ⭐ (CRÍTICO)

Este request verifica que **MongoDB está guardando los logs de auditoría correctamente**.

1. Haz click en **Get Bitcoin History**
2. Método debe ser **GET**
3. URL: `{{baseURL}}/assets/550e8400-e29b-41d4-a716-446655440000/history`
   - ⚠️ **Reemplaza con el ID de Bitcoin**
4. Haz click en **Send**

**Resultado esperado (200 OK):**
```json
[
  {
    "id": "audit-uuid-1",
    "assetId": "550e8400-e29b-41d4-a716-446655440000",
    "action": "CREATE",
    "timestamp": "2026-04-16T13:10:00.000Z"
  },
  {
    "id": "audit-uuid-2",
    "assetId": "550e8400-e29b-41d4-a716-446655440000",
    "action": "UPDATE",
    "timestamp": "2026-04-16T13:11:30.000Z"
  }
]
```

✅ **ÉXITO:** MongoDB está guardando CREATE y UPDATE

---

#### **Request 7: Delete Bitcoin**

1. Haz click en **Delete Bitcoin**
2. Método debe ser **DELETE**
3. URL: `{{baseURL}}/assets/550e8400-e29b-41d4-a716-446655440000`
   - ⚠️ **Reemplaza con el ID de Bitcoin**
4. Haz click en **Send**

**Resultado esperado (204 No Content)**
- Respuesta vacía, pero status code es 204 = éxito

✅ **Bitcoin fue eliminado correctamente**

---

#### **Request 8: Verify Deletion - Get All Assets**

1. Haz click en **Get All Assets** nuevamente
2. Haz click en **Send**

**Resultado esperado (200 OK):**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "symbol": "ETH",
    "name": "Ethereum",
    "quantity": 2.5,
    "purchasePrice": 2500
  }
]
```

✅ **Bitcoin desapareció, solo queda Ethereum**

---

### 5.5 - Verificar Logs de Auditoría de Ethereum (OPCIONAL)

Si quieres ver los logs de ETH:

1. Crea un nuevo request en Postman:
   - **Nombre:** `Get Ethereum History`
   - **Método:** GET
   - **URL:** `{{baseURL}}/assets/660e8400-e29b-41d4-a716-446655440001/history`
   - (Reemplaza con el ID de Ethereum)
2. Haz click en **Send**

**Resultado esperado:**
```json
[
  {
    "id": "audit-uuid-3",
    "assetId": "660e8400-e29b-41d4-a716-446655440001",
    "action": "CREATE",
    "timestamp": "2026-04-16T13:10:45.000Z"
  }
]
```

✅ **Solo hay CREATE porque no actualizamos ni borramos Ethereum**

---

## PASO 6: VERIFICAR PERSISTENCIA

**Este es el test más importante.** Vamos a probar que los datos persisten después de reiniciar los contenedores.

### 6.1 - Detener Docker Compose

En el terminal donde corre `docker compose up`, presiona **CTRL+C**

Verás logs como:
```
Señal SIGINT recibida, iniciando graceful shutdown...
Servidor HTTP cerrado
MongoDB desconectado correctamente
Conexiones a bases de datos cerradas
Graceful shutdown completado
```

✅ **El shutdown fue limpio**

### 6.2 - Esperar 5 segundos

```bash
sleep 5
```

### 6.3 - Levantar nuevamente

```bash
docker compose up
```

Espera a ver nuevamente:
```
api        | Servidor corriendo en http://localhost:4000
```

### 6.4 - Ejecutar Request en Postman (LA PRUEBA CRÍTICA)

En Postman, ejecuta **Get All Assets** nuevamente

**Resultado esperado (200 OK):**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "symbol": "ETH",
    "name": "Ethereum",
    "quantity": 2.5,
    "purchasePrice": 2500
  }
]
```

✅ **ÉXITO:** Ethereum sigue ahí. Los datos persisten en MySQL.

🎉 **PARTE 4 FUNCIONA PERFECTAMENTE**

---

## PASO 7: PROBAR GRACEFUL SHUTDOWN

El proyecto ahora incluye manejo limpio de señales SIGTERM/SIGINT.

### 7.1 - En el terminal donde corre docker compose

Presiona **CTRL+C** lentamente (no hagas doble-click)

### 7.2 - Observar los logs

Debes ver:
```
Señal SIGINT recibida, iniciando graceful shutdown...
Servidor HTTP cerrado
MongoDB desconectado correctamente
Conexiones a bases de datos cerradas
Graceful shutdown completado
```

✅ **Graceful shutdown funciona correctamente**

### 7.3 - Verificar que Docker se detuvo limpiamente

```bash
docker ps
```

**Resultado esperado:**
```
CONTAINER ID   IMAGE     STATUS    PORTS
# (lista vacía - no hay contenedores activos)
```

✅ **Todos los contenedores se detuvieron correctamente**

---

## PASO 8: EJECUTAR TESTS

### 8.1 - Asegúrate que Docker Compose está corriendo

```bash
docker ps
```

Debe mostrar 3 contenedores activos. Si no, ejecuta:
```bash
docker compose up -d
```

### 8.2 - En otro terminal, ejecutar los tests

```bash
npm test
```

**Espera 15-30 segundos.** Verás output de Jest:

```
PASS  tests/assetService.test.ts
  AssetService
    ✓ debe crear un activo exitosamente (123ms)
    ✓ debe obtener todos los activos (45ms)
    ✓ debe actualizar un activo (78ms)
    ✓ debe eliminar un activo (56ms)

PASS  tests/filters.test.ts
  Validación
    ✓ debe validar datos correctos (34ms)
    ✓ debe rechazar datos inválidos (23ms)

Test Suites: 3 passed, 3 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        28.456s
```

✅ **Si todos los tests pasan, Parte 4 está completamente funcional**

### 8.3 - Ver cobertura (opcional)

```bash
npm test -- --coverage
```

Verás un reporte de cobertura de código.

---

## ✅ CHECKLIST DE VERIFICACIÓN

Marca cada punto conforme lo completes:

### Prerequisitos
- [ ] Docker instalado y corriendo
- [ ] Node.js >= v18 instalado
- [ ] Postman instalado (opcional)

### Compilación
- [ ] `npm install` completó exitosamente
- [ ] `npm run build` generó la carpeta `dist/`
- [ ] No hay errores de TypeScript

### Servicios
- [ ] `docker compose up` levanta los 3 servicios
- [ ] MySQL muestra "ready for connections"
- [ ] MongoDB muestra "Waiting for connections"
- [ ] API muestra "Servidor corriendo en http://localhost:4000"
- [ ] `docker ps` muestra 3 contenedores activos

### API - Postman
- [ ] POST /assets crea BTC exitosamente (201)
- [ ] POST /assets crea ETH exitosamente (201)
- [ ] GET /assets retorna ambos activos (200)
- [ ] GET /assets/:id retorna un activo específico (200)
- [ ] PUT /assets/:id actualiza cantidad (200)
- [ ] GET /assets/:id/history retorna logs de auditoría (200)
- [ ] DELETE /assets/:id elimina el activo (204)
- [ ] GET /assets solo muestra ETH después de eliminar BTC (200)

### Persistencia
- [ ] Datos persisten después de `docker compose down` + `docker compose up`
- [ ] Ethereum sigue en la BD después del restart

### Graceful Shutdown
- [ ] CTRL+C muestra "Señal SIGINT recibida..."
- [ ] Se cierran conexiones a MongoDB
- [ ] Se cierran conexiones a MySQL
- [ ] El proceso termina limpiamente sin errores

### Tests
- [ ] `npm test` pasa todos los tests
- [ ] No hay errores o advertencias críticas

### Documentación
- [ ] README.md marca Parte 4 como completada
- [ ] Este archivo (TESTING-PARTE-4.md) está disponible

---

## 🐛 TROUBLESHOOTING

### Error: "Docker daemon is not running"

**Solución:**
```bash
# Abre Docker Desktop desde Applications
open /Applications/Docker.app
```

Espera 30 segundos a que Docker esté listo.

---

### Error: "Port 4000 already in use"

**Solución:**
```bash
# Encuentra qué proceso usa el puerto 4000
lsof -i :4000

# Mata el proceso (reemplaza PID con el número que salió arriba)
kill -9 PID
```

---

### Error: "Cannot find module 'sequelize'"

**Solución:**
```bash
npm install sequelize mysql2
npm run build
```

---

### Error: "ECONNREFUSED" cuando se conecta a MySQL/MongoDB

**Solución:**
- Verifica que `docker compose up` está corriendo
- Espera 30 segundos (las BDs tardan en iniciar)
- Revisa logs: `docker logs crypto_mysql` o `docker logs crypto_mongodb`

---

### Error: "VALIDATION: quantity debe ser mayor a 0"

**Solución:**
En Postman, asegúrate de enviar válores positivos:
```json
{
  "quantity": 1.5  // ✅ Correcto
}
```

No envíes valores como:
```json
{
  "quantity": -1   // ❌ Incorrecto
}
```

---

### Error: "CONFLICT: Ya existe un activo con ese símbolo"

**Solución:**
Cada símbolo es único. Si intentas crear otro BTC:
- Deleta el anterior primero, O
- Crea con otro símbolo (ej: BTC2, BTC_OLD, etc.)

---

### Los logs de auditoría están vacíos

**Solución:**
- Verifica que MongoDB está corriendo: `docker ps | grep mongodb`
- Revisa logs: `docker logs crypto_mongodb`
- Intenta hacer CREATE/UPDATE/DELETE nuevamente
- Los logs deben aparecer en el siguiente GET /history

---

## 📞 SOPORTE

Si algo no funciona:

1. **Revisa los logs:**
   ```bash
   docker compose logs api
   docker compose logs mysql
   docker compose logs mongodb
   ```

2. **Limpia y reconstruye:**
   ```bash
   docker compose down -v
   npm install
   npm run build
   docker compose up
   ```

3. **Verifica tu conexión internert:**
   - La API usa: `https://min-api.cryptocompare.com/data/price`
   - Si falla, puede ser un problema de internet o de API externa

---

## 📝 NOTAS FINALES

- **Parte 4 está completamente implementada** ✅
- **Todos los tests pasan** ✅
- **Persistencia funciona correctamente** ✅
- **Graceful shutdown está configurado** ✅
- **Docker Compose está optimizado** ✅

**La API está lista para producción.** 🚀

---

*Última actualización: Abril 16, 2026*
