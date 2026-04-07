const express = require('express');
const sql = require('mssql');
const path = require('path');

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

// Especialidades
app.get('/api/especialidades', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.Especialidades');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ingresos
app.get('/api/ingresos', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.Ingresos');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alergias
app.get('/api/alergias', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM dbo.Alergias');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor corriendo en http://localhost:3000');
});

module.exports = app;