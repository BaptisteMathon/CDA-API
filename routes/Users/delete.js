const Users = require('../../models/users');
const Posts = require('../../models/posts');
const Forums = require('../../models/forum');
const forum = require('../../models/forum');

async function deleteUser(req, res) {
    const { id } = req.params;

    try {
        const user = await Users.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Posts.deleteMany({ owner: id });

        await Posts.updateMany(
            { 'comments.user': id },
            { $pull: { comments: { user: id } } }
        );

        await Posts.updateMany(
            { likes: id },
            { $pull: { likes: id } }
        );

        await Users.updateMany(
            { followers: id },
            { $pull: { followers: id } }
        );

        await Users.updateMany(
            { followings: id },
            { $pull: { followings: id } }
        );

        await Forums.deleteMany({ forumOwner: id });

        await Forums.updateMany(
            { 'forumContent.user': id },
            { $pull: { forumContent: { user: id } } }
        );

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    deleteUser
}