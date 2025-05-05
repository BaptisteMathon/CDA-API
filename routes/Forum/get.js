const Forum = require('../../models/forum');

async function getAllForums(req, res){
    try{
        const forums = await Forum.find();
        res.status(200).json(forums);
    } catch(error){
        console.error("Error fetching forums:", error);
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

async function getForumById(req, res){
    try{
        const forum = await Forum.findById(req.params.id);
        if(!forum){
            return res.status(404).json({message: 'Forum not found'})
        }
        res.status(200).json(forum);
    } catch(error){
        console.error('Error fetching forum by ID:', error);
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

module.exports = {
    getAllForums,
    getForumById
}