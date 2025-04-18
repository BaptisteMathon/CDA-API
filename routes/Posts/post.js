const Posts = require('../../models/posts');

async function addPost(req, res){
    const image = req.file ? req.file.filename : null
    const {description, tags, owner} = req.body

    if(!image){
        return res.status(400).json({message: 'Image is required'})
    }

    try{
        const newPost = new Posts({
            // owner: req.UserId,
            owner,
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