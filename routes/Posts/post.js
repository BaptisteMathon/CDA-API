const Posts = require('../../models/posts');

async function addPost(req, res) {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
    const imageUrl = req.body.imageUrl || null;
    const { description, owner } = req.body;
    let tags = req.body.tags
  
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image is required' });
    }

    if(typeof tags === 'string'){
        tags = [tags]
    } else if(!Array.isArray(tags)){
        tags = []
    }
  
    try {
      const newPost = new Posts({
        owner,
        image: imageUrl,
        description: description || '',
        tags: tags || []
      });
  
      console.log('Post à sauvegarder :', newPost);

      await newPost.save();
      res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
      console.error('Error creating post: ', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }
  

module.exports = {
    addPost
}