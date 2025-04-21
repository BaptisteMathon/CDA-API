const User = require('../models/users');
let bcrypt = require('bcrypt');
const config = require('../config/keys');
let jwt = require('jsonwebtoken');

// for oauth
const crypto = require('crypto');
const axios = require('axios');

exports.signup = async (req, res) => {    
    try{

        const {prenom, nom, username, password, email} = req.body
        if (!prenom || !nom || !username || !password || !email) {
            return res.status(400).json({message: 'Les champs Prénoms, Nom, Nom d\'utilisateur, Mot de passe et Email sont obligatoires'})
        }

        const existingUserEmail = await User.findOne({ email })
        if (existingUserEmail) {
            return res.status(400).json({message: 'Cette adresse email est déjà utilisée'})
        }

        const existingUserUsername = await User.findOne({ username })
        if (existingUserUsername) {
            return res.status(400).json({message: 'Ce nom d\'utilisateur est déjà utilisé'})
        }

        const user = new User({
            prenom,
            nom,
            username,
            password: bcrypt.hashSync(password, 10),
            email,
            bio: req.body.bio,
            // profile_picture: req.file ? req.file.filename : 'null.png',
            profile_picture: req.body.imageUrl
        })

        await user.save()

        const token = jwt.sign({id: user._id, email: user.email},
            config.secret, {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                // expiresIn: 86400 // 24 heures
            }
        )

        res.status(200).send({
            id: user._id,
            prenom: user.prenom,
            nom: user.nom,
            username: user.username,
            email: user.email,
            bio: user.bio,
            profile_picture: user.profile_picture,
            accesToken: token,
            message: 'User was registered successfully!'
        })
    } catch(err){
        console.error(err)
        res.status(500).json({message: 'Erreur lors de la création du compte', error: err.message})
    }
}

exports.signin = async (req, res) => {
    try{

        const user = await User.findOne({email: req.body.email});
        if (!user) {
            return res.status(404).json({ accesToken: null, message: 'Adresse mail inconnue' })
        }
    
        let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    
        if(!passwordIsValid){
            return res.status(401).send({
                accesToken: null,
                message: 'Mot de passe incorrect'
            })
        }
    
        const token = jwt.sign({id: user._id, email: user.email},
            config.secret, {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: 86400 // 24 heures
            }
        )
    
        res.status(200).send({
            id: user._id,
            prenom: user.prenom,
            nom: user.nom,
            email: user.email,
            accesToken: token,
            message: 'User was registered successfully!'
        })
    } catch(error){
        console.error(error)
        res.status(500).json({message: 'Erreur lors de la connexion', error: error.message})
    }
}

exports.signout = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.send({message: 'Logged out successfully!'});
}