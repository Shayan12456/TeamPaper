const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
        },
        owner: {
            type: String,
            required: true,
        },
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);