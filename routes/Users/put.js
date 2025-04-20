const Users = require('../../models/users');
const bcrypt = require('bcrypt');

async function updateUser(req, res){
    const { id } = req.params;
    const { prenom, nom, username, bio } = req.body;

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
                profile_picture: req.body.profile_picture || req.file.filename,
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

async function follow (req, res){
    const {idToFollow} = req.params
    const {id} = req.body

    try{
        const user = await Users.findById(id)

        if(!user){
            return res.status(404).json({message: 'User not found'})
        }

        const userToFollow = await Users.findById(idToFollow)
        if(!userToFollow){
            return res.status(404).json({message: 'User to foloow not found='})
        }

        user.following.push(idToFollow)
        await user.save()

        userToFollow.followers.push(id)
        await userToFollow.save()

        res.status(200).json({message: 'Follow succesful'})

        
    } catch(error){
        console.error('Error updating follow: ', error);
        res.status(500).json({message: 'Server error' })
    }
}

async function unfollow (req, res){
    const {idToUnfollow} = req.params
    const {id} = req.body

    try{
        const user = await Users.findById(id)
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }

        const userToUnfollow = await Users.findById(idToUnfollow)
        console.log("idToUnfollow: ", idToUnfollow)
        if(!userToUnfollow){
            return res.status(404).json({message: 'User to unfollow not found'})
        }

        const indexUser = user.following.indexOf(idToUnfollow)
        const indexUserUnfollow = userToUnfollow.followers.indexOf(id)

        if(indexUser > -1){
            user.following.splice(indexUser, 1);
        } else {
            return res.status(400).json({ message: 'User not found (me)' });
        }

        if(indexUserUnfollow > -1){
            userToUnfollow.followers.splice(indexUserUnfollow, 1);
        } else {
            return res.status(400).json({ message: 'User not found (to unfollow)' });
        }

        await user.save()
        await userToUnfollow.save()

        res.status(200).json({message: 'Unfollow Succesful'})
    } catch(error){
        console.error('Error unfollowing people', error)
        res.status(500).json({message: 'Server error'})
    }
}

module.exports = {
    updateUser,
    updatePassword,
    follow,
    unfollow
}