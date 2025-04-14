const { all } = require('axios');
const Posts = require('../../models/posts');
const Users = require('../../models/users');

async function addLikes (req, res){
    const { idPost } = req.params;
    const { idUser } = req.body;

    try{
        const post = await Posts.findById(idPost);
        if(!post){
            return res.status(404).json({ message: 'Post not found' });
        }

        const userExists = await Users.findById(idUser);
        if(!userExists){
            return res.status(404).json({ message: 'User not found' });
        }

        const postLikes = post.likes;

        postLikes.push(idUser);

        await post.save();
        res.status(200).json({ message: 'Like added successfully', post });
    } catch(error){
        console.error('Error adding like:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function addComments (req, res){
    const {idPost } = req.params;
    const { idUser, comment } = req.body;

    try{
        const post = await Posts.findById(idPost)
        if(!post){
            return res.status(404).json({ message: 'Post not found' })
        }

        const userExists = await Users.findById(idUser)
        if(!userExists){
            return res.status(404).json({ message: 'User not found' })
        }

        if(!comment){
            return res.status(400).json({ message: 'Comment is required' })
        }

        const newComment = {
            user: String(idUser),
            text: comment
        }

        post.comments.push(newComment)

        await post.save()
        res.status(200).json({ message: 'Comment added successfully', post })
    } catch(error){
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function removeLikes (req, res){
    const { idPost} = req.params;
    const { idUser } = req.body;

    try{
        const post = await Posts.findById(idPost);
        if(!post){
            return res.status(404).json({ message: 'Post not found' });
        }

        const userExists = await Users.findById(idUser);
        if(!userExists){
            return res.status(404).json({ message: 'User not found' });
        }

        const postLikes = post.likes;
        const index = postLikes.indexOf(idUser);
        if(index > -1){
            postLikes.splice(index, 1);
        } else {
            return res.status(400).json({ message: 'User has not liked this post' });
        }
        await post.save();
        res.status(200).json({ message: 'Like removed successfully', post });
    } catch(error){
        console.error('Error removing like:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function removeComments (req, res){
    const {idPost} = req.params;
    const { idUser, commentId } = req.body;

    try{
        const post = await Posts.findById(idPost);
        if(!post){
            return res.status(404).json({ message: 'Post not found' });
        }

        const userExists = await Users.findById(idUser);
        if(!userExists){
            return res.status(404).json({ message: 'User not found' });
        }

        const allIdComments = post.comments.map(comment => comment._id.toString())
        const index = allIdComments.indexOf(commentId);
        if(index > -1){
            post.comments.splice(index, 1);
        } else {
            return res.status(400).json({ message: 'Comment not found' });
        }

        await post.save();
        res.status(200).json({ message: 'Comment removed successfully', post });

    } catch(error){
        console.error('Error removing comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    addLikes,
    removeLikes,
    addComments,
    removeComments
}