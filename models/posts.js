const mongoose = require('mongoose');

const PostsSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    created_at: { type: Date, default: Date.now },

    likes: [{ type: String }],
    comments: [{
        user: { type: String, required: true },
        text: { type: String, required: true },
        created_at: { type: Date, default: Date.now }
    }]
}, {collection: 'Posts'})

module.exports = mongoose.model('Posts', PostsSchema);