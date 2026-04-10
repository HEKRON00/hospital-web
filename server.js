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
// RUTA PRINCIPAL
// ==========================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================================
// RUTAS GET - SOLO LLAMAN A VISTAS (100% SEGURO)
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
    const result = await pool.request().query('SELECT * FROM dbo.vw_Citas ORDER BY Fecha, Hora ASC');
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

// ==========================================================
// RUTAS POST (Inserciones) - PARAMETRIZADAS (SEGURAS)
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
      .query(`INSERT INTO dbo.Pacientes (primer_nombre, apellido, fecha_nacimiento, genero, Ciudad_Id, numero_contacto, correo_electronico) VALUES (@primer_nombre, @apellido, @fecha_nacimiento, @genero, @Ciudad_Id, @numero_contacto, @correo_electronico)`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doctores', async (req, res) => {
  try {
    const { nombre, apellido, especialidad, telefono, correo, horario } = req.body;
    const pool = await sql.connect(config);
    
    await pool.request()
      .input('primer_nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('especialidad', sql.NVarChar, especialidad)
      .input('numero_contacto', sql.NVarChar, telefono || null)
      .input('correo_electronico', sql.NVarChar, correo || null)
      .input('horario_disponible', sql.NVarChar, horario || null)
      .query(`
        INSERT INTO dbo.Doctores 
        (primer_nombre, apellido, especialidad, numero_contacto, correo_electronico, horario_disponible) 
        VALUES (@primer_nombre, @apellido, @especialidad, @numero_contacto, @correo_electronico, @horario_disponible)
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
      res.json({ success: true });
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
    const pool = await sql.connect(config);
    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('marca', sql.NVarChar, marca || null)
      .input('tipo', sql.NVarChar, tipo || null)
      .input('dosis', sql.NVarChar, dosis || null)
      .input('cantidad_stock', sql.Int, stock || 0)
      .query(`INSERT INTO dbo.Medicamentos (nombre, marca, tipo, dosis, cantidad_stock) VALUES (@nombre, @marca, @tipo, @dosis, @cantidad_stock)`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/Citas', async (req, res) => {
  try {
    const { paciente_id, doctor_id, fecha_cita, hora_cita, proposito } = req.body;
    const pool = await sql.connect(config);
    await pool.request()
      .input('paciente_id', sql.Int, paciente_id)
      .input('doctor_id', sql.Int, doctor_id || null)
      .input('fecha_cita', sql.Date, fecha_cita)
      .input('hora_cita', sql.NVarChar, hora_cita)
      .input('Estado_Id', sql.Int, 1)
      .input('proposito', sql.NVarChar, proposito || null)
      .query(`INSERT INTO dbo.Citas (paciente_id, doctor_id, fecha_cita, hora_cita, Estado_Id, proposito) VALUES (@paciente_id, @doctor_id, @fecha_cita, @hora_cita, @Estado_Id, @proposito)`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==========================================================
// RUTAS DELETE (Eliminar registros)
// ==========================================================

// Eliminar Paciente
app.delete('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Pacientes WHERE paciente_id = @id');
    res.json({ success: true, message: 'Paciente eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /api/pacientes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar Doctor
app.delete('/api/doctores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Doctores WHERE doctor_id = @id');
    res.json({ success: true, message: 'Doctor eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /api/doctores:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar Enfermera (elimina de Enfermeros y Personal)
app.delete('/api/Enfermeras/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    
    // Primero obtener el personal_id
    const result = await pool.request()
      .input('enfermero_id', sql.Int, id)
      .query('SELECT personal_id FROM dbo.Enfermeros WHERE enfermero_id = @enfermero_id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Enfermera no encontrada' });
    }
    
    const personal_id = result.recordset[0].personal_id;
    
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      // Eliminar de Enfermeros
      await transaction.request()
        .input('enfermero_id', sql.Int, id)
        .query('DELETE FROM dbo.Enfermeros WHERE enfermero_id = @enfermero_id');
      
      // Eliminar de Personal
      await transaction.request()
        .input('personal_id', sql.Int, personal_id)
        .query('DELETE FROM dbo.Personal WHERE personal_id = @personal_id');
      
      await transaction.commit();
      res.json({ success: true, message: 'Enfermera eliminada correctamente' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error en DELETE /api/Enfermeras:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar Medicamento
app.delete('/api/Medicamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Medicamentos WHERE medicamento_id = @id');
    res.json({ success: true, message: 'Medicamento eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /api/Medicamentos:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar Cita
app.delete('/api/Citas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Citas WHERE cita_id = @id');
    res.json({ success: true, message: 'Cita eliminada correctamente' });
  } catch (err) {
    console.error('Error en DELETE /api/Citas:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// INICIAR SERVIDOR
// ==========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🏥 Sistema Hospitalario ANDAGON - Vistas SQL');
  console.log('✅ Servidor corriendo en puerto:', PORT);
});

module.exports = app;