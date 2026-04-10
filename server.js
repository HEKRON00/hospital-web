const express = require('express');
const sql = require('mssql');
const path = require('path');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================================
// CONFIGURACIÓN DE CONEXIÓN - AZURE SQL (HOSPITAL_DB)
// ==========================================================
const config = {
  // Prioriza variables de entorno (para Vercel), si no, usa tus datos fijos
  server: process.env.DB_SERVER || 'db-andagon.database.windows.net',
  database: process.env.DB_NAME || 'HOSPITAL_DB',
  user: process.env.DB_USER || 'admin_uth',
  password: process.env.DB_PASSWORD || 'Hospital123!',
  options: {
    encrypt: true,                   // Azure requiere true
    trustServerCertificate: false,   // Azure requiere false
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// ==========================================================
// RUTA PRINCIPAL
// ==========================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================================
// RUTAS GET (Consultas)
// ==========================================================

app.get('/api/pacientes', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        p.paciente_id AS ID,
        p.primer_nombre AS Nombre,
        p.apellido AS Apellido,
        p.fecha_nacimiento AS Nacimiento,
        p.genero AS Género,
        c.Nombre_Ciudad AS Ciudad,
        p.numero_contacto AS Teléfono,
        p.correo_electronico AS Correo
      FROM dbo.Pacientes p
      LEFT JOIN dbo.Cat_Ciudades c ON p.Ciudad_Id = c.Ciudad_Id
      ORDER BY p.paciente_id
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/pacientes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/doctores', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        doctor_id AS ID,
        primer_nombre AS Nombre,
        apellido AS Apellido,
        especialidad AS Especialidad,
        numero_contacto AS Teléfono,
        correo_electronico AS Correo,
        horario_disponible AS Horario
      FROM dbo.Doctores
      ORDER BY doctor_id
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/doctores:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/Enfermeros', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        e.enfermero_id AS ID,
        p.primer_nombre AS Nombre,
        p.apellido AS Apellido,
        p.rol AS Rol,
        e.especializacion AS Especialización,
        ISNULL(d.nombre_departamento, 'No asignado') AS Departamento,
        ISNULL(e.horas_turno, 'No especificado') AS Turno
      FROM dbo.Enfermeros e
      INNER JOIN dbo.Personal p ON e.personal_id = p.personal_id
      LEFT JOIN dbo.Departamentos d ON p.departamento_id = d.departamento_id
      WHERE p.rol LIKE '%Enfermero%' OR p.rol LIKE '%Enfermera%'
      ORDER BY e.enfermero_id ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/Enfermeros:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/Enfermeras', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        e.enfermero_id AS ID,
        p.primer_nombre AS Nombre,
        p.apellido AS Apellido,
        p.rol AS Rol,
        e.especializacion AS Especialización,
        ISNULL(d.nombre_departamento, 'No asignado') AS Departamento,
        ISNULL(e.horas_turno, 'No especificado') AS Turno
      FROM dbo.Enfermeros e
      INNER JOIN dbo.Personal p ON e.personal_id = p.personal_id
      LEFT JOIN dbo.Departamentos d ON p.departamento_id = d.departamento_id
      WHERE p.rol LIKE '%Enfermero%' OR p.rol LIKE '%Enfermera%'
      ORDER BY e.enfermero_id ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/Enfermeras:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/Medicamentos', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        medicamento_id AS ID,
        nombre AS Nombre,
        marca AS Marca,
        tipo AS Tipo,
        dosis AS Dosis,
        cantidad_stock AS Stock,
        fecha_vencimiento AS Vencimiento
      FROM dbo.Medicamentos
      ORDER BY nombre
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/Medicamentos:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/Citas', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        c.cita_id AS ID,
        p.primer_nombre + ' ' + p.apellido AS Paciente,
        d.primer_nombre + ' ' + d.apellido AS Doctor,
        c.fecha_cita AS Fecha,
        c.hora_cita AS Hora,
        e.Nombre_Estado AS Estado,
        c.proposito AS Propósito
      FROM dbo.Citas c
      JOIN dbo.Pacientes p ON c.paciente_id = p.paciente_id
      LEFT JOIN dbo.Doctores d ON c.doctor_id = d.doctor_id
      LEFT JOIN dbo.Cat_Estados e ON c.Estado_Id = e.Estado_Id
      ORDER BY c.fecha_cita DESC, c.hora_cita DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/Citas:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ciudades', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT Ciudad_Id AS id, Nombre_Ciudad AS nombre 
      FROM dbo.Cat_Ciudades 
      ORDER BY Nombre_Ciudad
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/ciudades:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/especialidades-lista', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT DISTINCT especialidad AS nombre 
      FROM dbo.Doctores 
      WHERE especialidad IS NOT NULL 
      ORDER BY especialidad
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/especialidades-lista:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/especializaciones-lista', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT DISTINCT especializacion AS nombre 
      FROM dbo.Enfermeros 
      WHERE especializacion IS NOT NULL 
      ORDER BY especializacion
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/especializaciones-lista:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/departamentos', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT departamento_id AS id, nombre_departamento AS nombre 
      FROM dbo.Departamentos 
      ORDER BY nombre_departamento
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/departamentos:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// RUTAS POST (Inserciones)
// ==========================================================

app.post('/api/pacientes', async (req, res) => {
  try {
    const { nombre, apellido, fecha_nacimiento, genero, ciudad_id, telefono, correo } = req.body;
    const pool = await sql.connect(config);
    
    await pool.request()
      .input('primer_nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
      .input('genero', sql.NVarChar, genero || null)
      .input('Ciudad_Id', sql.Int, ciudad_id || null)
      .input('numero_contacto', sql.NVarChar, telefono || null)
      .input('correo_electronico', sql.NVarChar, correo || null)
      .query(`
        INSERT INTO dbo.Pacientes 
        (primer_nombre, apellido, fecha_nacimiento, genero, Ciudad_Id, numero_contacto, correo_electronico) 
        VALUES (@primer_nombre, @apellido, @fecha_nacimiento, @genero, @Ciudad_Id, @numero_contacto, @correo_electronico)
      `);
    
    res.json({ success: true, message: 'Paciente agregado correctamente' });
  } catch (err) {
    console.error('Error en POST /api/pacientes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doctores', async (req, res) => {
  try {
    const { nombre, apellido, especialidad, telefono, correo } = req.body;
    const pool = await sql.connect(config);
    
    await pool.request()
      .input('primer_nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('especialidad', sql.NVarChar, especialidad)
      .input('numero_contacto', sql.NVarChar, telefono || null)
      .input('correo_electronico', sql.NVarChar, correo || null)
      .query(`
        INSERT INTO dbo.Doctores 
        (primer_nombre, apellido, especialidad, numero_contacto, correo_electronico) 
        VALUES (@primer_nombre, @apellido, @especialidad, @numero_contacto, @correo_electronico)
      `);
    
    res.json({ success: true, message: 'Doctor agregado correctamente' });
  } catch (err) {
    console.error('Error en POST /api/doctores:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/Enfermeras', async (req, res) => {
  try {
    const { nombre, apellido, especializacion, departamento_id, horas_turno } = req.body;
    const pool = await sql.connect(config);
    
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      const resultadoPersonal = await transaction.request()
        .input('primer_nombre', sql.NVarChar, nombre)
        .input('apellido', sql.NVarChar, apellido)
        .input('rol', sql.NVarChar, 'Enfermero')
        .input('departamento_id', sql.Int, departamento_id || null)
        .query(`
          INSERT INTO dbo.Personal (primer_nombre, apellido, rol, departamento_id)
          OUTPUT INSERTED.personal_id
          VALUES (@primer_nombre, @apellido, @rol, @departamento_id)
        `);
      
      const personal_id = resultadoPersonal.recordset[0].personal_id;
      
      await transaction.request()
        .input('personal_id', sql.Int, personal_id)
        .input('especializacion', sql.NVarChar, especializacion || null)
        .input('horas_turno', sql.NVarChar, horas_turno || null)
        .query(`
          INSERT INTO dbo.Enfermeros (personal_id, especializacion, horas_turno)
          VALUES (@personal_id, @especializacion, @horas_turno)
        `);
      
      await transaction.commit();
      res.json({ success: true, message: 'Enfermera agregada correctamente' });
      
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    
  } catch (err) {
    console.error('Error en POST /api/Enfermeras:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/Medicamentos', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        medicamento_id AS ID,
        nombre AS Nombre,
        marca AS Marca,
        tipo AS Tipo,
        dosis AS Dosis,
        cantidad_stock AS Stock,
        fecha_vencimiento AS Vencimiento
      FROM dbo.Medicamentos
      ORDER BY medicamento_id ASC   -- ← Ordenado por ID (más reciente primero = mayor ID)
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/Medicamentos:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// INSERTAR CITAS
// ==========================================================
app.get('/api/Citas', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        c.cita_id AS ID,
        p.primer_nombre + ' ' + p.apellido AS Paciente,
        ISNULL(d.primer_nombre + ' ' + d.apellido, 'No asignado') AS Doctor,
        c.fecha_cita AS Fecha,
        c.hora_cita AS Hora,
        ISNULL(e.Nombre_Estado, 'Pendiente') AS Estado,
        c.proposito AS Propósito
      FROM dbo.Citas c
      JOIN dbo.Pacientes p ON c.paciente_id = p.paciente_id
      LEFT JOIN dbo.Doctores d ON c.doctor_id = d.doctor_id
      LEFT JOIN dbo.Cat_Estados e ON c.Estado_Id = e.Estado_Id
      ORDER BY c.cita_id DESC   -- ← Ordenado por ID descendente (más recientes primero)
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/Citas:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// INICIAR SERVIDOR
// ==========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🏥 Sistema Hospitalario ANDAGON - Azure SQL (HOSPITAL_DB)');
  console.log('✅ Servidor corriendo en puerto:', PORT);
});

module.exports = app;