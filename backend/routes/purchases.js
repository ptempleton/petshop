const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM pet_purchases ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM pet_purchases WHERE id = $1', [req.params.id]);
      if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', async (req, res) => {
    const { pet_id, pet_name, pet_type, pet_picture, pet_price, new_owner } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const purchase = await client.query(
        'INSERT INTO pet_purchases (pet_id, pet_name, pet_type, pet_picture, pet_price, new_owner) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [pet_id, pet_name, pet_type, pet_picture || null, pet_price || null, new_owner]
      );
      await client.query('UPDATE pets SET available = false WHERE id = $1', [pet_id]);
      await client.query('COMMIT');
      res.status(201).json(purchase.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  });

  router.delete('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const purchase = await client.query('SELECT pet_id FROM pet_purchases WHERE id = $1', [req.params.id]);
      if (!purchase.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Not found' });
      }
      await client.query('DELETE FROM pet_purchases WHERE id = $1', [req.params.id]);
      const petId = purchase.rows[0].pet_id;
      if (petId) {
        await client.query('UPDATE pets SET available = true WHERE id = $1', [petId]);
      }
      await client.query('COMMIT');
      res.status(204).send();
    } catch (err) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  });

  return router;
};
