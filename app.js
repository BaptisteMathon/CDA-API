const express = require('express');
const app = express();
const mongoose  = require('mongoose');
const dotenv = require('dotenv');
const port = process.env.PORT || 3001;
const cors = require('cors');
const multer = require('multer')
const path = require('path');
const streamifier = require('streamifier');
const cloudinary = require('./config/cloudinary')

app.use(cors());
dotenv.config();
app.use(express.json());
// app.use('/uploads', express.static('uploads'));

const {getAllUsers, getUserById, getUserFollowers, getUserFollowing} = require('./routes/Users/get');
const {getAllPosts, getPostByUserId, getPostById, getCommentsByPostId} = require('./routes/Posts/get');

const {addPost} = require('./routes/Posts/post')

const {updateUser, updatePassword, follow, unfollow} = require('./routes/Users/put')
const {addLikes, removeLikes, addComments, removeComments} = require('./routes/Posts/put')

const {deleteUser} = require('./routes/Users/delete')
const {deletePost} = require('./routes/Posts/delete')

const authcontroller = require('./routes/authcontroller');
const authJwt = require('./middlewares/authJwt');
const rateLimitMiddleware = require('./middlewares/rateLimiter');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/profil_pictures')
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname))
//     }
// })
// const upload = multer({ storage })

// const secondStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/publications')
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname))
//     }
// })

// const uploadPost = multer({ storage: secondStorage })

const storage = multer.memoryStorage()
const upload = multer({storage})

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

async function uploadToCloudinary(buffer, folder){
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {folder},
            (error, result) => {
                if(result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream)
    })
}

function cloudinaryUpload(folder = '', fieldName = 'imageUrl') {
    return async (req, res, next) => {
        try{
            if (!req.file || !req.file.buffer) {
                return res.status(400).json({ error: 'No file provided' });
            }
    
            const result = await uploadToCloudinary(req.file.buffer, folder);
            req.body[fieldName] = result.secure_url;
            next();
        } catch(error){
            console.error('Error uploading to cloudinary: ', error)
            res.status(500).json({error: 'Failed to upload image to Cloudinary'})
        }
    }
}

app.get('/', [rateLimitMiddleware], (req, res) => {
    res.sendFile(__dirname + '/front/index.html');
});

app.get('/users', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getAllUsers)
app.get('/user/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getUserById)
app.get('/posts', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getAllPosts)
app.get('/posts/user/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getPostByUserId)
app.get('/post/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getPostById)
app.get('/comments/:idPost', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getCommentsByPostId)
app.get('/allFollowers/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getUserFollowers)
app.get('/allFollowings/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getUserFollowing)

app.post('/post', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], upload.single('image'), cloudinaryUpload('publications', 'imageUrl'), addPost)

app.put('/user/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], upload.single('profile_picture'), cloudinaryUpload('profile_picture', 'imageUrl'), updateUser)
app.put('/user/:id/password', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], updatePassword)
app.put('/post/like/:idPost', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], addLikes)
app.put('/post/unlike/:idPost', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], removeLikes)
app.put('/post/comment/:idPost', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], addComments)
app.put('/post/deleteComment/:idPost', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], removeComments)
app.put('/follow/:idToFollow', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], follow)
app.put('/unfollow/:idToUnfollow', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], unfollow)

app.delete('/user/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], deleteUser)
app.delete('/post/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], deletePost)

app.post('/api/auth/signup', rateLimitMiddleware, upload.single('profile_picture'), cloudinaryUpload('profile_picture', 'imageUrl'), authcontroller.signup);
app.post('/api/auth/signin', [rateLimitMiddleware], authcontroller.signin);
app.post('/api/auth/signout', [rateLimitMiddleware], authcontroller.signout);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})