const Users = require('../../models/users');

async function getAllUsers(req, res) {
    try{
        const users = await Users.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

async function getUserById(req, res) {
    try{
        const user = await Users.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch(error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

async function getUserFollowers(req, res) {
    try {
        const user = await Users.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.followers);
    } catch (error) {
        console.error('Error fetching user followers:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

async function getUserFollowing(req, res) {
    try {
        const user = await Users.findById(req.params.id);
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }
        res.status(200).json(user.following)
    } catch(error){
        console.error('Error fetching user following: ', error);
        res.status(500).json({message: 'Erreur serveur'})
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserFollowers,
    getUserFollowing
};