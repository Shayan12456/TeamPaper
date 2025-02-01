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
        // createdAt: "2025-01-31T12:00:00Z",
        // updatedAt: "2025-01-31T12:10:00Z"
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);