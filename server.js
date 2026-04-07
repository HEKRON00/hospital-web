const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.static('public'));

const config = {
  server: 'db-andagon.database.windows.net',
  database: 'HOSPITAL_DB',
  user: 'admin_uth',
  password: 'Hospital123!',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// Pacientes
app.get('/api/pacientes', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.Pacientes');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctores
app.get('/api/doctores', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.Doctores');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enfermeros
app.get('/api/Enfermeros', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.Enfermeros');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Medicamentosapp.get('/api/Medicamentos', async (req, res) => {
    app.get('/api/Medicamentos', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.Medicamentos');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Citas
app.get('/api/Citas', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
    SELECT 
        cita_id, 
        paciente_id, 
        doctor_id, 
        fecha_cita, 
        FORMAT(CAST(hora_cita AS datetime), 'hh:mm tt') AS hora_cita, 
        Estado_Id, 
        proposito 
    FROM dbo.Citas
`);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});