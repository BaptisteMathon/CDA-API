const Forum = require('../../models/forum');

async function addForum(req, res) {
    const {forumName, description, forumOwner} = req.body;

    if(!forumName || !forumOwner) {
        return res.status(400).json({ message: 'Forum name and owner are required' });
    }

    try{
        const newForum = new Forum({
            forumName,
            description: description || '',
            forumOwner,
            forumContent: []
        })

        await newForum.save();
        res.status(201).json({ message: "Forum created successfully", forum: newForum });
    } catch(error){
        console.error('Error creating forum: ', error);
        res.status(500).json({ error: 'Failed to create forum' });
    }
}

module.exports = {
    addForum
}