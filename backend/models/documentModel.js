const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true,
        },
        content: {
            type: Object,
        },
        owner: {//can create, edit and comment and delete the document - can be only one
            type: String,
            required: true,
        },
        editor: {//can edit and comment
            type: [{ type: mongoose.Schema.Types.String, ref: "User" }],
            required: true,
        },
        viewer: {//can see only but cannot edit or comment
            type: [{ type: mongoose.Schema.Types.String, ref: "User" }],
            required: true,
        },  
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);