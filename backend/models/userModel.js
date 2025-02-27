const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "Author",
    required: true,
  }, 
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }], // Array of references

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);