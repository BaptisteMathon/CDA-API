const Posts = require('../../models/posts');

async function addPost(req, res){
    const {image, description, tags} = req.body

    if(!image){
        return res.status(400).json({message: 'Image is required'})
    }

    try{
        const newPost = new Posts({
            // owner: req.UserId,
            owner: req.body.id,
            image,
            description: description || '',
            tags: tags || []
        })

        await newPost.save()
        res.status(201).json({message: "Post created successfully ", post: newPost})
    } catch(error) {
        console.error('Error creating post: ', error)
        res.status(500).json({error: 'Failed to create post'})
    }
}

module.exports = {
    addPost
}