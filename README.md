# 🏥 Sistema Hospitalario ANDAGON

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Estado](https://img.shields.io/badge/estado-FINALIZADO-brightgreen.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)
![SQL Server](https://img.shields.io/badge/SQL_Server-Azure-red.svg)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)
![Licencia](https://img.shields.io/badge/licencia-ISC-yellow.svg)

<div align="center">
  <img src="https://img.shields.io/badge/UTH-Universidad%20Tecnol%C3%B3gica%20de%20Honduras-0F6E56?style=for-the-badge" alt="UTH">
</div>

---

## 📋 Tabla de Contenidos

- [📖 Descripción](#-descripción)
- [✨ Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Despliegue en Vercel](#-despliegue-en-vercel)
- [🔐 Autenticación](#-autenticación)
- [📊 Módulos](#-módulos)
- [📎 Exportación](#-exportación)
- [🌙 Modo Oscuro](#-modo-oscuro)
- [👥 Autores](#-autores)
- [📄 Licencia](#-licencia)

---

## 📖 Descripción

El **Sistema Hospitalario ANDAGON** es una aplicación web completa para la gestión integral de un hospital. Permite administrar pacientes, doctores, enfermeras, medicamentos, citas y habitaciones en tiempo real.

Desarrollado como proyecto universitario para la **Universidad Tecnológica de Honduras (UTH)**, el sistema implementa una arquitectura de tres capas con **Node.js + Express** como backend, **Azure SQL Database** como base de datos y un frontend responsive con **HTML5, CSS3 y JavaScript** puro.

> 🌐 **Aplicación en producción:** [https://hospital-web.vercel.app](https://hospital-web.vercel.app)

---

## ✨ Características

| Característica | Descripción |
|---------------|-------------|
| 🔐 **Login con roles** | Administrador (CRUD completo) e Invitado (solo lectura) |
| 👤 **Gestión de Pacientes** | Alta, baja, modificación y consulta con dropdown de ciudades |
| 🩺 **Gestión de Doctores** | CRUD completo con especialidades y horarios |
| 👩‍⚕️ **Gestión de Enfermeras** | CRUD con especializaciones y departamentos |
| 💊 **Gestión de Medicamentos** | Inventario con stock y fechas de vencimiento |
| 📅 **Gestión de Citas** | Agenda con pacientes, doctores, fechas y estados |
| 🏥 **Gestión de Habitaciones** | Administración de habitaciones por tipo y estado |
| 📊 **Estadísticas en tiempo real** | Contadores dinámicos de registros por módulo |
| 📎 **Exportar a Excel** | Descarga de datos en formato `.xls` con UTF-8 (tildes y ñ) |
| 🌙 **Modo Oscuro** | Toggle para cambiar entre tema claro y oscuro (guarda preferencia) |
| ✅ **Validaciones robustas** | Email, teléfono, fechas futuras, stock no negativo |
| 🗑️ **Mensajes de error amigables** | Protección de integridad referencial con mensajes claros |
| 📱 **Diseño responsive** | Adaptable a móviles, tablets y escritorio |

---

## 🛠️ Tecnologías

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Font Awesome](https://img.shields.io/badge/Font_Awesome-339AF0?style=for-the-badge&logo=fontawesome&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

### Base de Datos
![Azure SQL](https://img.shields.io/badge/Azure_SQL_Database-0089D6?style=for-the-badge&logo=microsoftazure&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)

### Despliegue
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

---

## 📁 Estructura del Proyecto
BD_HOSPITAL/
├── server.js # Backend principal (Node.js + Express)
├── package.json # Dependencias y scripts
├── vercel.json # Configuración para despliegue en Vercel
├── .gitignore # Archivos ignorados por Git
└── public/
├── login.html # Página de autenticación
├── index.html # Panel principal del sistema
└── css/
├── estilo.css # Tema claro
├── estilo-oscuro.css # Tema oscuro
└── login.css # Estilos del login

text

---

## 🚀 Despliegue en Vercel

El sistema está desplegado en **Vercel** con integración continua desde **GitHub**.

| Plataforma | URL |
|-----------|-----|
| 🌐 **Producción** | [https://hospital-web.vercel.app](https://hospital-web.vercel.app) |
| 📁 **Repositorio** | [https://github.com/HEKRON00/hospital-web](https://github.com/HEKRON00/hospital-web) |

### Variables de Entorno (Vercel)

| Variable | Valor |
|----------|-------|
| `DB_SERVER` | `db-andagon.database.windows.net` |
| `DB_NAME` | `HOSPITAL_DB` |
| `DB_USER` | `admin_uth` |
| `DB_PASSWORD` | `Hospital123!` |

> ⚠️ **Nota:** Estas credenciales son para el entorno de producción. No se comparten en el código fuente.

---

## 🔐 Autenticación

El sistema cuenta con **login por roles**:

| Usuario | Contraseña | Rol | Permisos |
|---------|-----------|-----|----------|
| `admin` | `admin123` | **Administrador** | ✅ CRUD completo en todos los módulos |
| `invitado` | `invitado123` | **Invitado** | 👁️ Solo lectura (vistas) |

> 🔒 Las rutas POST, PUT y DELETE están protegidas con middleware de autenticación.

---

## 📊 Módulos

### 👤 Pacientes
- Registro con nombre, apellido, fecha de nacimiento, género, ciudad (dropdown), teléfono y correo.
- Validación de email y teléfono.

### 🩺 Doctores
- Registro con nombre, apellido, especialidad (dropdown + opción "Otra"), teléfono, correo y horario.

### 👩‍⚕️ Enfermeras
- Registro con nombre, apellido, especialización (dropdown + opción "Otra"), departamento y turno.

### 💊 Medicamentos
- Inventario con nombre, marca, tipo, dosis y stock.
- Validación de stock no negativo.

### 📅 Citas
- Agenda con selección de paciente y doctor (dropdowns), fecha, hora y propósito.
- Validación de fecha futura.
- Formato de fecha: `yyyy-MM-dd`, hora: `HH:mm`.

### 🏥 Habitaciones
- Gestión de habitaciones con número, tipo (dropdown), capacidad y estado.

---

## 📎 Exportación a Excel

Todos los módulos permiten exportar los datos a **Excel** (`.xls`) con:

- ✅ Codificación **UTF-8** (tildes, ñ y caracteres especiales correctos)
- ✅ Cabeceras formateadas
- ✅ Un clic desde el botón **Exportar**

---

## 🌙 Modo Oscuro

El sistema incluye un **toggle** para cambiar entre tema claro y oscuro:

- 🌞 **Tema Claro**: Tonos verdes corporativos
- 🌚 **Tema Oscuro**: Tonos oscuros con verde esmeralda

La preferencia se guarda en `localStorage`.

---

## 👥 Autores

<table>
  <tr>
    <td align="center">
      <strong>Anny Junith Orellana Maldonado</strong><br>
      <sub>202210040267</sub>
    </td>
    <td align="center">
      <strong>Yensi Dayana Miguel Ramos</strong><br>
      <sub>202010020072</sub>
    </td>
    <td align="center">
      <strong>Fredy Hernan Gonzales Gomez</strong><br>
      <sub>202310110052</sub>
    </td>
  </tr>
</table>

### 👨‍🏫 Catedrático
**Kevin Alexander Maradiaga Sarmiento**

### 🏛️ Universidad
**Universidad Tecnológica de Honduras (UTH)**  
Facultad de Ingeniería · Ingeniería en Computación / Informática

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos para la Universidad Tecnológica de Honduras.

**ISC License** - Ver archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  <img src="https://img.shields.io/badge/UTH-Liderazgo%20con%20Visi%C3%B3n%20Tecnol%C3%B3gica-0F6E56?style=for-the-badge" alt="UTH">
  <br><br>
  <p>© 2026 - Sistema Hospitalario ANDAGON v2.0 - Proyecto Universitario</p>
  <p>🏥 Desarrollado con ❤️ por el equipo ANDAGON</p>
</div>