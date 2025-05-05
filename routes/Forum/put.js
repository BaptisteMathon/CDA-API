const Forum = require('../../models/forum');
const Users = require('../../models/users');

async function addContentForum(req, res){
    const { idForum } = req.params;
    const { user, message } = req.body;

    try{
        const forum = await Forum.findById(idForum);
        if(!forum){
            return res.status(404).json({ message: 'Forum not found' });
        }

        const userExists = await Users.findById(user);
        if(!userExists){
            return res.status(404).json({ message: 'User not found' });
        }

        if(!message){
            return res.status(400).json({ message: 'Message is required' });
        }

        const newMessage = {
            user: String(user),
            message: message
        }

        forum.forumContent.push(newMessage);

        await forum.save();
        res.status(200).json({ message: 'Message added successfully', forum });
    } catch(error){
        console.error('Error adding message:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function deleteContentForum(req, res){
    const { idForum } = req.params;
    const { idMessage } = req.body;

    try{
        const forum = await Forum.findById(idForum);
        if(!forum){
            return res.status(404).json({message: 'Forum not found'});
        }

        const allIdMessages = forum.forumContent.map(message => message._id.toString());
        const index = allIdMessages.indexOf(idMessage);
        if(index > -1){
            forum.forumContent.splice(index, 1);
        } else {
            return res.status(400).json({ message: 'Message not found' });
        }

        await forum.save();
        res.status(200).json({ message: 'Message removed successfully', forum });
    } catch(error){
        console.error('Error removing message: ', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    addContentForum,
    deleteContentForum
}