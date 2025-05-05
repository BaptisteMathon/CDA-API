const Forum = require('../../models/forum');

async function deleteForum(req, res) {
    try {
        const forum = await Forum.findByIdAndDelete(req.params.id);
        if (!forum) {
            return res.status(404).json({ message: 'Forum not found' });
        }

        res.status(200).json({ message: 'Forum deleted successfully' });
    } catch (error) {
        console.error('Error deleting forum:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    deleteForum
}