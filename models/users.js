const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    prenom: { type: String, required: true },
    nom: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profile_picture: { type: String, default: '' },
    bio: { type: String, default: '' },
    is_verified: { type: Boolean, default: false },

    followers: [{ type: String }],
    following: [{ type: String }],

    created_at: { type: Date, default: Date.now },
}, {collection: 'Users'});

module.exports = mongoose.model('Users', UsersSchema);