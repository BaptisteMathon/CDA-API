const User = require('../models/users');
let bcrypt = require('bcrypt');
const config = require('../config/keys');
let jwt = require('jsonwebtoken');

// for oauth
// const crypto = require('crypto');
// const axios = require('axios');

exports.signup = async (req, res) => {
    const user = new User({
        prenom: req.body.prenom,
        nom: req.body.nom,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10),
        email: req.body.email,
        bio: req.body.bio,
        profile_picture: req.body.profile_picture,
    })

    try{
        await user.save()

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
            username: user.username,
            email: user.email,
            bio: user.bio,
            profile_picture: user.profile_picture,
            accesToken: token,
            message: 'User was registered successfully!'
        })
    } catch(err){
        console.error(err)
        res.status(500).send('Erreur lors de la création du compte')
    }
}

exports.signin = async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if(!passwordIsValid){
        return res.status(401).send({
            accesToken: null,
            message: 'Invalid Password'
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
}

exports.signout = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.send({message: 'Logged out successfully!'});
}