const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const { type } = req.query;
    try {
      let query, params;
      if (type) {
        query = 'SELECT * FROM pets WHERE pet_type = $1 ORDER BY name';
        params = [type];
      } else {
        query = 'SELECT * FROM pets ORDER BY name';
        params = [];
      }
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM pets WHERE id = $1', [req.params.id]);
      if (!result.rows.length) return res.status(404).json({ error: 'Pet not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', async (req, res) => {
    const { name, gender, pet_type, price, picture, description, available } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO pets (name, gender, pet_type, price, picture, description, available) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [name, gender || null, pet_type, price || null, picture || null, description || null, available ?? true]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    const { name, gender, pet_type, price, picture, description, available } = req.body;
    try {
      const result = await pool.query(
        'UPDATE pets SET name=$1, gender=$2, pet_type=$3, price=$4, picture=$5, description=$6, available=$7 WHERE id=$8 RETURNING *',
        [name, gender || null, pet_type, price || null, picture || null, description || null, available, req.params.id]
      );
      if (!result.rows.length) return res.status(404).json({ error: 'Pet not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM pets WHERE id = $1', [req.params.id]);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
