const express = require('express');
const app = express();
const mongoose  = require('mongoose');
const dotenv = require('dotenv');
const port = process.env.PORT || 3001;
const cors = require('cors');

app.use(cors());
dotenv.config();
app.use(express.json());

const {getAllUsers, getUserById} = require('./routes/Users/get');
const {getAllPosts, getPostByUserId, getPostById} = require('./routes/Posts/get');

const {addPost} = require('./routes/Posts/post')

const {updateUser, updatePassword} = require('./routes/Users/put')
const {addLikes, removeLikes, addComments, removeComments} = require('./routes/Posts/put')

const {deleteUser} = require('./routes/Users/delete')
const {deletePost} = require('./routes/Posts/delete')

const authcontroller = require('./routes/authcontroller');
const authJwt = require('./middlewares/authJwt');
const rateLimitMiddleware = require('./middlewares/rateLimiter');

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.get('/', [rateLimitMiddleware], (req, res) => {
    res.sendFile(__dirname + '/front/index.html');
});

app.get('/users', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getAllUsers)
app.get('/user/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getUserById)
app.get('/posts', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getAllPosts)
app.get('/posts/user/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getPostByUserId)
app.get('/post/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], getPostById)

app.post('/post', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], addPost)

app.put('/user/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], updateUser)
app.put('/user/:id/password', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], updatePassword)
app.put('/post/like/:idPost', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], addLikes)
app.put('/post/unlike/:idPost', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], removeLikes)
app.put('/post/comment/:idPost', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], addComments)
app.put('/post/deleteComment/:idPost', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], removeComments)

app.delete('/user/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], deleteUser)
app.delete('/post/:id', [authJwt.verifyToken, authJwt.isExist, rateLimitMiddleware], deletePost)

app.post('/api/auth/signup', [rateLimitMiddleware], authcontroller.signup);
app.post('/api/auth/signin', [rateLimitMiddleware], authcontroller.signin);
app.post('/api/auth/signout', [rateLimitMiddleware], authcontroller.signout);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})