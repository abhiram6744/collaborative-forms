const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  label: String,
  type: { type: String, enum: ['text', 'number', 'dropdown'], required: true },
  options: [String] // for dropdown
});

const FormSchema = new mongoose.Schema({
  title: String,
  fields: [FieldSchema],
  formCode: { type: String, unique: true },
  response: Object // shared response { fieldId: value }
});

module.exports = mongoose.model('Form', FormSchema);
