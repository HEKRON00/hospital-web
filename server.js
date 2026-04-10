const express = require('express');
const sql = require('mssql');
const path = require('path');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================================
// CONFIGURACIÓN DE CONEXIÓN - AZURE SQL
// ==========================================================
const config = {
  server: process.env.DB_SERVER || 'db-andagon.database.windows.net',
  database: process.env.DB_NAME || 'HOSPITAL_DB',
  user: process.env.DB_USER || 'admin_uth',
  password: process.env.DB_PASSWORD || 'Hospital123!',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  }
};

// ==========================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ==========================================================
function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (decoded.exp < Date.now()) {
      return res.status(401).json({ error: 'Sesión expirada' });
    }
    
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function verificarAdmin(req, res, next) {
  if (req.usuario?.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador.' });
  }
  next();
}

// ==========================================================
// FUNCIONES DE VALIDACIÓN
// ==========================================================
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && re.test(email);
}

function validarTelefono(telefono) {
  const re = /^[0-9\-\+\s]{8,15}$/;
  return telefono && re.test(telefono);
}

function validarFechaFutura(fecha) {
  return new Date(fecha) >= new Date(new Date().toDateString());
}

// ==========================================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// ==========================================================

// Redirigir raíz a login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// API de login
app.post('/api/login', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    
    if (!usuario || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }
    
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('nombre_usuario', sql.NVarChar, usuario)
      .input('contrasena', sql.NVarChar, contrasena)
      .query(`
        SELECT usuario_id, nombre_usuario, nombre_completo, rol 
        FROM dbo.Usuarios 
        WHERE nombre_usuario = @nombre_usuario 
          AND contrasena = @contrasena 
          AND activo = 1
      `);
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    
    const usuarioData = result.recordset[0];
    
    const token = Buffer.from(JSON.stringify({
      id: usuarioData.usuario_id,
      usuario: usuarioData.nombre_usuario,
      rol: usuarioData.rol,
      exp: Date.now() + (24 * 60 * 60 * 1000)
    })).toString('base64');
    
    res.json({
      success: true,
      token,
      usuario: {
        id: usuarioData.usuario_id,
        nombre_usuario: usuarioData.nombre_usuario,
        nombre_completo: usuarioData.nombre_completo,
        rol: usuarioData.rol
      }
    });
    
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Panel principal
app.get('/panel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================================
// RUTAS GET (Públicas - solo lectura)
// ==========================================================
app.get('/api/pacientes', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.vw_Pacientes ORDER BY ID');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/doctores', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.vw_Doctores ORDER BY ID');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/Enfermeros', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.vw_Enfermeros ORDER BY ID');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/Enfermeras', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.vw_Enfermeros ORDER BY ID');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/Medicamentos', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.vw_Medicamentos ORDER BY ID');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/Citas', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.vw_Citas ORDER BY Fecha DESC, Hora DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/habitaciones', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        h.habitacion_id AS ID,
        h.numero_habitacion AS Numero,
        ISNULL(t.nombre_tipo_habitacion, 'No especificado') AS Tipo,
        h.capacidad AS Capacidad,
        h.estado AS Estado,
        CONVERT(VARCHAR(10), h.ultimo_mantenimiento, 120) AS Ultimo_Mantenimiento
      FROM dbo.Habitaciones h
      LEFT JOIN dbo.Tipos_Habitacion t ON h.tipo_habitacion_id = t.tipo_habitacion_id
      ORDER BY h.numero_habitacion
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ciudades', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.vw_Ciudades ORDER BY nombre');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/especialidades-lista', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.vw_Especialidades ORDER BY nombre');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/especializaciones-lista', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.vw_Especializaciones ORDER BY nombre');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/departamentos', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.vw_Departamentos ORDER BY nombre');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tipos-habitacion', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT tipo_habitacion_id AS id, nombre_tipo_habitacion AS nombre FROM dbo.Tipos_Habitacion ORDER BY nombre_tipo_habitacion');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// EXPORTAR A EXCEL (UTF-8 CORREGIDO)
// ==========================================================
app.get('/api/exportar/:modulo', async (req, res) => {
  try {
    const { modulo } = req.params;
    const pool = await sql.connect(config);
    
    let query = '';
    let filename = '';
    
    switch (modulo) {
      case 'pacientes':
        query = 'SELECT * FROM dbo.vw_Pacientes ORDER BY ID';
        filename = 'pacientes.xls';
        break;
      case 'doctores':
        query = 'SELECT * FROM dbo.vw_Doctores ORDER BY ID';
        filename = 'doctores.xls';
        break;
      case 'enfermeras':
        query = 'SELECT * FROM dbo.vw_Enfermeros ORDER BY ID';
        filename = 'enfermeras.xls';
        break;
      case 'medicamentos':
        query = 'SELECT * FROM dbo.vw_Medicamentos ORDER BY ID';
        filename = 'medicamentos.xls';
        break;
      case 'citas':
        query = 'SELECT * FROM dbo.vw_Citas ORDER BY Fecha DESC, Hora DESC';
        filename = 'citas.xls';
        break;
      case 'habitaciones':
        query = `
          SELECT 
            h.habitacion_id AS ID,
            h.numero_habitacion AS Numero,
            ISNULL(t.nombre_tipo_habitacion, 'No especificado') AS Tipo,
            h.capacidad AS Capacidad,
            h.estado AS Estado,
            CONVERT(VARCHAR(10), h.ultimo_mantenimiento, 120) AS Ultimo_Mantenimiento
          FROM dbo.Habitaciones h
          LEFT JOIN dbo.Tipos_Habitacion t ON h.tipo_habitacion_id = t.tipo_habitacion_id
          ORDER BY h.numero_habitacion
        `;
        filename = 'habitaciones.xls';
        break;
      default:
        return res.status(400).json({ error: 'Módulo no válido' });
    }
    
    const result = await pool.request().query(query);
    const datos = result.recordset;
    
    if (datos.length === 0) {
      return res.status(404).json({ error: 'No hay datos para exportar' });
    }
    
    const cabeceras = Object.keys(datos[0]);
    
    let html = '<html><head><meta charset="UTF-8"></head><body>';
    html += '<table border="1">';
    
    html += '<thead><tr>';
    cabeceras.forEach(c => html += `<th>${c}</th>`);
    html += '</tr></thead>';
    
    html += '<tbody>';
    datos.forEach(fila => {
      html += '<tr>';
      cabeceras.forEach(c => {
        let val = fila[c] ?? '';
        val = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    html += '</body></html>';
    
    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=UTF-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(html, 'utf-8'));
    
  } catch (err) {
    console.error('Error en exportar:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// MIDDLEWARE PARA PROTEGER RUTAS POST, PUT, DELETE
// ==========================================================
app.use(['/api/*'], (req, res, next) => {
  if (req.method === 'GET') return next();
  verificarToken(req, res, (err) => {
    if (err) return;
    verificarAdmin(req, res, next);
  });
});

// ==========================================================
// RUTAS POST (Insertar)
// ==========================================================
app.post('/api/pacientes', async (req, res) => {
  try {
    const { nombre, apellido, fecha_nacimiento, genero, ciudad_id, telefono, correo } = req.body;
    if (!nombre || !apellido || !fecha_nacimiento) return res.status(400).json({ error: 'Nombre, apellido y fecha son obligatorios' });
    if (correo && !validarEmail(correo)) return res.status(400).json({ error: 'Formato de correo inválido' });
    if (telefono && !validarTelefono(telefono)) return res.status(400).json({ error: 'Formato de teléfono inválido' });
    
    const pool = await sql.connect(config);
    await pool.request()
      .input('primer_nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
      .input('genero', sql.NVarChar, genero || null)
      .input('Ciudad_Id', sql.Int, ciudad_id || null)
      .input('numero_contacto', sql.NVarChar, telefono || null)
      .input('correo_electronico', sql.NVarChar, correo || null)
      .query(`INSERT INTO dbo.Pacientes (primer_nombre, apellido, fecha_nacimiento, genero, Ciudad_Id, numero_contacto, correo_electronico) VALUES (@primer_nombre, @apellido, @fecha_nacimiento, @genero, @Ciudad_Id, @numero_contacto, @correo_electronico)`);
    
    res.json({ success: true, message: 'Paciente agregado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doctores', async (req, res) => {
  try {
    const { nombre, apellido, especialidad, telefono, correo, horario } = req.body;
    if (!nombre || !apellido || !especialidad) return res.status(400).json({ error: 'Nombre, apellido y especialidad son obligatorios' });
    if (correo && !validarEmail(correo)) return res.status(400).json({ error: 'Formato de correo inválido' });
    
    const pool = await sql.connect(config);
    await pool.request()
      .input('primer_nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('especialidad', sql.NVarChar, especialidad)
      .input('numero_contacto', sql.NVarChar, telefono || null)
      .input('correo_electronico', sql.NVarChar, correo || null)
      .input('horario_disponible', sql.NVarChar, horario || null)
      .query(`INSERT INTO dbo.Doctores (primer_nombre, apellido, especialidad, numero_contacto, correo_electronico, horario_disponible) VALUES (@primer_nombre, @apellido, @especialidad, @numero_contacto, @correo_electronico, @horario_disponible)`);
    
    res.json({ success: true, message: 'Doctor agregado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/Enfermeras', async (req, res) => {
  try {
    const { nombre, apellido, especializacion, departamento_id, horas_turno } = req.body;
    if (!nombre || !apellido) return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
    
    const pool = await sql.connect(config);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const result = await transaction.request()
        .input('primer_nombre', sql.NVarChar, nombre)
        .input('apellido', sql.NVarChar, apellido)
        .input('rol', sql.NVarChar, 'Enfermero')
        .input('departamento_id', sql.Int, departamento_id || null)
        .query(`INSERT INTO dbo.Personal (primer_nombre, apellido, rol, departamento_id) OUTPUT INSERTED.personal_id VALUES (@primer_nombre, @apellido, @rol, @departamento_id)`);
      const personal_id = result.recordset[0].personal_id;
      await transaction.request()
        .input('personal_id', sql.Int, personal_id)
        .input('especializacion', sql.NVarChar, especializacion || null)
        .input('horas_turno', sql.NVarChar, horas_turno || null)
        .query(`INSERT INTO dbo.Enfermeros (personal_id, especializacion, horas_turno) VALUES (@personal_id, @especializacion, @horas_turno)`);
      await transaction.commit();
      res.json({ success: true, message: 'Enfermera agregada correctamente' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/Medicamentos', async (req, res) => {
  try {
    const { nombre, marca, tipo, dosis, stock } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (stock !== undefined && (isNaN(stock) || stock < 0)) return res.status(400).json({ error: 'El stock no puede ser negativo' });
    
    const pool = await sql.connect(config);
    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('marca', sql.NVarChar, marca || null)
      .input('tipo', sql.NVarChar, tipo || null)
      .input('dosis', sql.NVarChar, dosis || null)
      .input('cantidad_stock', sql.Int, stock || 0)
      .query(`INSERT INTO dbo.Medicamentos (nombre, marca, tipo, dosis, cantidad_stock) VALUES (@nombre, @marca, @tipo, @dosis, @cantidad_stock)`);
    
    res.json({ success: true, message: 'Medicamento agregado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/Citas', async (req, res) => {
  try {
    const { paciente_id, doctor_id, fecha_cita, hora_cita, proposito } = req.body;
    if (!paciente_id || !fecha_cita || !hora_cita) return res.status(400).json({ error: 'Paciente, fecha y hora son obligatorios' });
    if (!validarFechaFutura(fecha_cita)) return res.status(400).json({ error: 'La fecha debe ser hoy o futura' });
    
    const pool = await sql.connect(config);
    await pool.request()
      .input('paciente_id', sql.Int, paciente_id)
      .input('doctor_id', sql.Int, doctor_id || null)
      .input('fecha_cita', sql.Date, fecha_cita)
      .input('hora_cita', sql.NVarChar, hora_cita)
      .input('Estado_Id', sql.Int, 1)
      .input('proposito', sql.NVarChar, proposito || null)
      .query(`INSERT INTO dbo.Citas (paciente_id, doctor_id, fecha_cita, hora_cita, Estado_Id, proposito) VALUES (@paciente_id, @doctor_id, @fecha_cita, @hora_cita, @Estado_Id, @proposito)`);
    
    res.json({ success: true, message: 'Cita agregada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habitaciones', async (req, res) => {
  try {
    const { numero, tipo_id, capacidad, estado } = req.body;
    if (!numero) return res.status(400).json({ error: 'El número de habitación es obligatorio' });
    
    const pool = await sql.connect(config);
    await pool.request()
      .input('numero_habitacion', sql.VarChar, numero)
      .input('tipo_habitacion_id', sql.Int, tipo_id || null)
      .input('capacidad', sql.Int, capacidad || 1)
      .input('estado', sql.NVarChar, estado || 'Disponible')
      .query(`INSERT INTO dbo.Habitaciones (numero_habitacion, tipo_habitacion_id, capacidad, estado, ultimo_mantenimiento) VALUES (@numero_habitacion, @tipo_habitacion_id, @capacidad, @estado, GETDATE())`);
    
    res.json({ success: true, message: 'Habitación agregada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// RUTAS PUT (Actualizar)
// ==========================================================
app.put('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, fecha_nacimiento, genero, ciudad_id, telefono, correo } = req.body;
    if (correo && !validarEmail(correo)) return res.status(400).json({ error: 'Formato de correo inválido' });
    
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .input('primer_nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
      .input('genero', sql.NVarChar, genero || null)
      .input('Ciudad_Id', sql.Int, ciudad_id || null)
      .input('numero_contacto', sql.NVarChar, telefono || null)
      .input('correo_electronico', sql.NVarChar, correo || null)
      .query(`UPDATE dbo.Pacientes SET primer_nombre=@primer_nombre, apellido=@apellido, fecha_nacimiento=@fecha_nacimiento, genero=@genero, Ciudad_Id=@Ciudad_Id, numero_contacto=@numero_contacto, correo_electronico=@correo_electronico WHERE paciente_id=@id`);
    
    res.json({ success: true, message: 'Paciente actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/doctores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, especialidad, telefono, correo, horario } = req.body;
    if (correo && !validarEmail(correo)) return res.status(400).json({ error: 'Formato de correo inválido' });
    
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .input('primer_nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('especialidad', sql.NVarChar, especialidad)
      .input('numero_contacto', sql.NVarChar, telefono || null)
      .input('correo_electronico', sql.NVarChar, correo || null)
      .input('horario_disponible', sql.NVarChar, horario || null)
      .query(`UPDATE dbo.Doctores SET primer_nombre=@primer_nombre, apellido=@apellido, especialidad=@especialidad, numero_contacto=@numero_contacto, correo_electronico=@correo_electronico, horario_disponible=@horario_disponible WHERE doctor_id=@id`);
    
    res.json({ success: true, message: 'Doctor actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/Medicamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, marca, tipo, dosis, stock } = req.body;
    if (stock !== undefined && (isNaN(stock) || stock < 0)) return res.status(400).json({ error: 'El stock no puede ser negativo' });
    
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.NVarChar, nombre)
      .input('marca', sql.NVarChar, marca || null)
      .input('tipo', sql.NVarChar, tipo || null)
      .input('dosis', sql.NVarChar, dosis || null)
      .input('cantidad_stock', sql.Int, stock || 0)
      .query(`UPDATE dbo.Medicamentos SET nombre=@nombre, marca=@marca, tipo=@tipo, dosis=@dosis, cantidad_stock=@cantidad_stock WHERE medicamento_id=@id`);
    
    res.json({ success: true, message: 'Medicamento actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/Citas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { paciente_id, doctor_id, fecha_cita, hora_cita, proposito } = req.body;
    if (fecha_cita && !validarFechaFutura(fecha_cita)) return res.status(400).json({ error: 'La fecha debe ser hoy o futura' });
    
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .input('paciente_id', sql.Int, paciente_id)
      .input('doctor_id', sql.Int, doctor_id || null)
      .input('fecha_cita', sql.Date, fecha_cita)
      .input('hora_cita', sql.NVarChar, hora_cita)
      .input('proposito', sql.NVarChar, proposito || null)
      .query(`UPDATE dbo.Citas SET paciente_id=@paciente_id, doctor_id=@doctor_id, fecha_cita=@fecha_cita, hora_cita=@hora_cita, proposito=@proposito WHERE cita_id=@id`);
    
    res.json({ success: true, message: 'Cita actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/habitaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, tipo_id, capacidad, estado } = req.body;
    
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .input('numero_habitacion', sql.VarChar, numero)
      .input('tipo_habitacion_id', sql.Int, tipo_id || null)
      .input('capacidad', sql.Int, capacidad || 1)
      .input('estado', sql.NVarChar, estado || 'Disponible')
      .query(`UPDATE dbo.Habitaciones SET numero_habitacion=@numero_habitacion, tipo_habitacion_id=@tipo_habitacion_id, capacidad=@capacidad, estado=@estado WHERE habitacion_id=@id`);
    
    res.json({ success: true, message: 'Habitación actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// RUTAS DELETE (Eliminar)
// ==========================================================
app.delete('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    await pool.request().input('id', sql.Int, id).query('DELETE FROM dbo.Pacientes WHERE paciente_id = @id');
    res.json({ success: true, message: 'Paciente eliminado correctamente' });
  } catch (err) {
    if (err.message.includes('REFERENCE constraint')) {
      res.status(400).json({ error: 'No se puede eliminar este paciente porque tiene citas o registros médicos asociados.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.delete('/api/doctores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    await pool.request().input('id', sql.Int, id).query('DELETE FROM dbo.Doctores WHERE doctor_id = @id');
    res.json({ success: true, message: 'Doctor eliminado correctamente' });
  } catch (err) {
    if (err.message.includes('REFERENCE constraint')) {
      res.status(400).json({ error: 'No se puede eliminar este doctor porque tiene citas programadas.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.delete('/api/Enfermeras/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    const result = await pool.request().input('enfermero_id', sql.Int, id).query('SELECT personal_id FROM dbo.Enfermeros WHERE enfermero_id = @enfermero_id');
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Enfermera no encontrada' });
    const personal_id = result.recordset[0].personal_id;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      await transaction.request().input('enfermero_id', sql.Int, id).query('DELETE FROM dbo.Enfermeros WHERE enfermero_id = @enfermero_id');
      await transaction.request().input('personal_id', sql.Int, personal_id).query('DELETE FROM dbo.Personal WHERE personal_id = @personal_id');
      await transaction.commit();
      res.json({ success: true, message: 'Enfermera eliminada correctamente' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    if (err.message.includes('REFERENCE constraint')) {
      res.status(400).json({ error: 'No se puede eliminar esta enfermera porque tiene asignaciones pendientes.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.delete('/api/Medicamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    await pool.request().input('id', sql.Int, id).query('DELETE FROM dbo.Medicamentos WHERE medicamento_id = @id');
    res.json({ success: true, message: 'Medicamento eliminado correctamente' });
  } catch (err) {
    if (err.message.includes('REFERENCE constraint')) {
      res.status(400).json({ error: 'No se puede eliminar este medicamento porque tiene registros de farmacia o recetas asociadas.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.delete('/api/Citas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    await pool.request().input('id', sql.Int, id).query('DELETE FROM dbo.Citas WHERE cita_id = @id');
    res.json({ success: true, message: 'Cita eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/habitaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    await pool.request().input('id', sql.Int, id).query('DELETE FROM dbo.Habitaciones WHERE habitacion_id = @id');
    res.json({ success: true, message: 'Habitación eliminada correctamente' });
  } catch (err) {
    if (err.message.includes('REFERENCE constraint')) {
      res.status(400).json({ error: 'No se puede eliminar esta habitación porque tiene asignaciones pendientes.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ==========================================================
// INICIAR SERVIDOR
// ==========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🏥 Sistema Hospitalario ANDAGON');
  console.log('🔐 Sistema de login con roles activado');
  console.log('✅ Servidor corriendo en puerto:', PORT);
});

module.exports = app;