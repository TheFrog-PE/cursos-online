# Instituto Peruano de Compliance — Intranet Web

> [!IMPORTANT]
> **Documentación del Proyecto en Fase Demo (Fase 1)**:
> - Consulte [FASES.md](file:///d:/intranet-web-cursos/FASES.md) para comprender la transición de Demo a Producción.
> - Consulte [DEMO-QUICKSTART.md](file:///d:/intranet-web-cursos/DEMO-QUICKSTART.md) para iniciar y probar rápidamente el sistema de demostración.

Plataforma de formación online del Instituto Peruano de Compliance (IPC). Permite a estudiantes acceder a programas de especialización, subir comprobantes de pago y gestionar tickets de soporte. Los administradores y editores gestionan usuarios, pagos y contenido desde un panel dedicado.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 8 + TypeScript 6 |
| Routing | React Router DOM v7 |
| Backend | Express 4 + TypeScript |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | JWT en cookies HTTP-only |
| Archivos | Cloudinary + Multer |
| Validación | Zod (backend) |
| Seguridad | express-rate-limit |

---

## Requisitos Previos

- Node.js ≥ 18
- PostgreSQL ≥ 14 corriendo localmente
- Cuenta en [Cloudinary](https://cloudinary.com/) (plan gratuito es suficiente)

---

## Estructura del Proyecto

```
intranet-web-cursos/
├── src/                        # Frontend (React + Vite)
│   ├── components/             # Componentes de UI y páginas
│   ├── contexts/               # AuthContext (estado global de sesión)
│   ├── router.tsx              # Definición de rutas con react-router-dom
│   ├── main.tsx                # Entry point
│   ├── services/api.ts         # Cliente HTTP (Axios)
│   └── types/                  # Tipos TypeScript compartidos
├── server/                     # Backend (Express + Prisma)
│   ├── src/
│   │   ├── controllers/        # Lógica de negocio por dominio
│   │   ├── middlewares/        # auth, validate
│   │   ├── routes/api.ts       # Router principal
│   │   ├── schemas/            # Schemas de validación Zod
│   │   └── config/             # Cloudinary, Prisma client
│   └── prisma/schema.prisma    # Esquema de la base de datos
└── .gitignore
```

---

## Configuración

### 1. Variables de Entorno del Backend

Crea el archivo `server/.env` (nunca lo subas a git):

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos PostgreSQL
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/ipc_db?schema=public"

# JWT — usa un valor largo y aleatorio en producción
JWT_SECRET="tu-secreto-muy-largo-y-aleatorio-aqui"

# CORS — URL del frontend
CLIENT_URL="http://localhost:5173"

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### 2. Variables de Entorno del Frontend

Si necesitas configurar el backend URL en el frontend, crea `.env` en la raíz:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Ejecutar el Proyecto

### Backend

```bash
cd server

# Instalar dependencias
npm install

# Configurar base de datos (primera vez)
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Iniciar servidor en modo desarrollo
npx tsx src/index.ts
# Alternativa: npm run dev
```

El backend queda disponible en: `http://localhost:3000`

### Frontend

```bash
# Desde la raíz del proyecto
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend queda disponible en: `http://localhost:5173`

---

## Autenticación (MVP)

El sistema usa autenticación basada en dominio de email:

| Prefijo del email | Rol asignado |
|---|---|
| `admin@...` | ADMIN |
| `editor@...` | EDITOR |
| Cualquier otro | STUDENT |

**Credenciales de prueba:**
- `admin@ipdcompliance` / `123456` → Panel Admin
- `editor@ipdcompliance` / `123456` → Panel Editor
- `estudiante@ipdcompliance` / `123456` → Dashboard Estudiante

> ⚠️ Esta lógica MVP está en `server/src/controllers/authController.ts`. Debe reemplazarse con autenticación real (bcrypt + base de datos) antes de producción.

---

## Rutas del Frontend

| URL | Página | Acceso |
|---|---|---|
| `/login` | Inicio de sesión | Público |
| `/dashboard` | Dashboard del estudiante | STUDENT |
| `/cursos/compliance` | Especialista en Compliance | STUDENT |
| `/cursos/odpc` | ODPC Certificado | STUDENT |
| `/cursos/hacker-financiero` | Hacker Financiero | STUDENT |
| `/perfil` | Mi Perfil | STUDENT |
| `/mecanografia` | Práctica de Mecanografía | STUDENT |
| `/soporte` | Soporte Técnico | STUDENT |
| `/pagos` | Mis Pagos | STUDENT |
| `/admin` | Panel Admin/Editor | ADMIN, EDITOR |
| `/ticket/:id` | Visor de Ticket | Público |

---

## Endpoints del Backend

### Autenticación
```
POST /api/auth/register    — Registro (rate limit: 5/hora)
POST /api/auth/login       — Login (rate limit: 10/15min)
POST /api/auth/logout      — Cerrar sesión
GET  /api/auth/me          — Sesión actual (requiere auth)
```

### Cursos
```
GET /api/courses                    — Lista de cursos
GET /api/courses/:id/lessons        — Lecciones (requiere auth)
```

### Pagos
```
POST /api/payments/upload           — Subir comprobante (requiere auth)
GET  /api/payments                  — Todos los pagos (ADMIN/EDITOR)
GET  /api/payments/user             — Pagos del usuario (requiere auth)
PUT  /api/payments/:id/status       — Actualizar estado (ADMIN/EDITOR)
```

### Soporte
```
POST /api/tickets/create            — Crear ticket (requiere auth)
GET  /api/tickets/user              — Tickets del usuario (requiere auth)
GET  /api/tickets                   — Todos los tickets (ADMIN/EDITOR)
GET  /api/tickets/:id               — Ver ticket (público)
POST /api/tickets/:id/message       — Agregar mensaje (requiere auth)
PUT  /api/tickets/:id/resolve       — Resolver ticket (ADMIN/EDITOR)
```

---

## Scripts Disponibles

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # Verificar código con ESLint
npm run lint:fix     # Corregir errores automáticamente
npm run preview      # Preview del build
```

### Backend
```bash
npm run dev          # Servidor con hot-reload (ts-node-dev)
npm run build        # Compilar TypeScript
npm run start        # Iniciar build compilado
npx prisma studio    # GUI para la base de datos
```

---

## Seguridad

- JWT almacenado en cookie HTTP-only (no accesible desde JS)
- Rate limiting en endpoints de autenticación
- Validación de entrada con Zod en todos los endpoints
- CORS restringido al dominio del frontend
- `.env` excluido de git

---

## Próximos Pasos (Roadmap)

- [ ] Reemplazar autenticación MVP con bcrypt + DB real
- [ ] Actualizar `cloudinary` SDK a v2+ (vulnerabilidad conocida)
- [ ] Agregar pruebas unitarias (Vitest + Jest)
- [ ] Sistema de notificaciones por email
- [ ] Panel de analytics para admin
