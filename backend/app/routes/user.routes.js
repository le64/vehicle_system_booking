const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');

// Routes protégées
router.use(authenticate);

router.get('/', (req, res) => {
  res.json({ message: 'Utilisateurs' });
});

module.exports = router;
