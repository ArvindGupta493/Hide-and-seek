const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    username: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, default: 0 },
}, { timestamps: true} );

module.exports = mongoose.model('Admin', adminSchema);

 

