const Posts = require('../../models/posts');

const sanitizeHtml = require('sanitize-html');

async function addPost(req, res) {
  const imageUrl = req.body.imageUrl || null;
  const { description, owner } = req.body;
  let tags = req.body.tags

  if (!imageUrl) {
    return res.status(400).json({ message: 'Image is required' });
  }

  if (typeof tags === 'string') {
    tags = [tags]
  } else if (!Array.isArray(tags)) {
    tags = []
  }

  const descriptionSanitize = sanitizeHtml(description, {
    allowedTags: [],
    allowedAttributes: []
  })


  try {
    const newPost = new Posts({
      owner,
      image: imageUrl,
      description: descriptionSanitize || '',
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