const Users = require('../../models/users');
const bcrypt = require('bcrypt');

async function updateUser(req, res){
    const { id } = req.params;
    const { prenom, nom, username, profile_picture, bio } = req.body;

    try{
        if(username){
            const existingUser = await Users.findOne({ username });
            if(existingUser && existingUser._id.toString() !== id){
                return res.status(400).json({ message: 'Username already exists' });
            }
        }
        const updatedUser = await Users.findByIdAndUpdate(
            id, 
            {
                prenom, 
                nom,
                username,
                profile_picture,
                bio
            },
            { new: true }
        );

        if(!updatedUser){
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch(error){
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function updatePassword (req, res){
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    try{
        const user = await Users.findById(id);

        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatching = await bcrypt.compare(oldPassword, user.password);
        if(!isMatching){
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if(isSamePassword){
            return res.status(400).json({ message: 'New password cannot be the same as old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch(error){
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    updateUser,
    updatePassword
}