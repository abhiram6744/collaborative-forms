const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

// Generate a unique code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

router.post('/create', async (req, res) => {
  const { title, fields } = req.body;
  const formCode = generateCode();
  try {
    const form = new Form({ title, fields, formCode, response: {} });
    await form.save();
    res.status(201).json({ formCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/join', async (req, res) => {
  const { code } = req.body;
  const form = await Form.findOne({ formCode: code });
  if (!form) return res.status(404).json({ error: 'Form not found' });
  res.json(form);
});

router.put('/update/:code', async (req, res) => {
  const { code } = req.params;
  const { updates } = req.body; // { fieldId: value }
  const form = await Form.findOne({ formCode: code });
  if (!form) return res.status(404).json({ error: 'Form not found' });
  form.response = { ...form.response, ...updates };
  await form.save();
  res.json({ status: 'updated' });
});

module.exports = router;
