const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use('/api/pets', require('./routes/pets')(pool));
app.use('/api/pet-types', require('./routes/petTypes')(pool));
app.use('/api/purchases', require('./routes/purchases')(pool));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
