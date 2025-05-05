const mongoose = require('mongoose');

const ForumSchema = new mongoose.Schema({
    forumName: { type: String, required: true },
    description: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    forumOwner: { type: String, required: true },
    forumContent: [{
        user: { type: String, required: true },
        message: { type: String, required: true },
        created_at: { type: Date, default: Date.now }
    }]
}, {collection: 'Forum'});

module.exports = mongoose.model('Forum', ForumSchema);