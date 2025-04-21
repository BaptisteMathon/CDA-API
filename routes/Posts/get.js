const Posts = require('../../models/posts');

async function getAllPosts(req, res) {
    try {
        const posts = await Posts.find();
        res.status(200).json(posts);
    } catch(error){
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

async function getPostByUserId(req, res) {
    try {
        const posts = await Posts.find({owner: req.params.id});
        if(!posts){
            return res.status(404).json({message: 'Post not found'})
        }
        res.status(200).json(posts);
    } catch(error){
        console.error("Error fetching posts by user ID:", error);
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

async function getPostById(req, res) {
    try {
        const post = await Posts.findById(req.params.id);
        if(!post){
            res.status(404).json({message: 'Post not found'})
        }
        res.status(200).json(post);
    } catch(error){
        console.error('Error fetching post by ID:', error);
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

async function getCommentsByPostId(req, res) {
    try {
        const post = await Posts.findById(req.params.idPost);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post.comments);
    } catch (error) {
        console.error('Error fetching comments by post ID:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

module.exports = {
    getAllPosts,
    getPostByUserId,
    getPostById,
    getCommentsByPostId
}