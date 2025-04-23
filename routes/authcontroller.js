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
            email: email.toLowerCase(),
            bio: req.body.bio,
            // profile_picture: req.file ? req.file.filename : 'null.png',
            profile_picture: req.body.imageUrl || "https://res.cloudinary.com/dizqqbonz/image/upload/v1745396944/profile_picture/t7f0rlkfiygvc5j9ofef.png"
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

        const emailLowerCase = req.body.email.toLowerCase()

        // const user = await User.findOne({email: req.body.email});
        const user = await User.findOne({email: emailLowerCase});
        if (!user) {
            return res.status(404).json({ accesToken: null, message: `Adresse mail inconnue ${emailLowerCase}` })
        }
    
        let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    
        if(!passwordIsValid){
            return res.status(401).send({
                accesToken: null,
                message: 'Mot de passe incorrect'
            })
        }
    
        const token = jwt.sign({id: user._id, email: emailLowerCase},
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
            email: emailLowerCase,
            accesToken: token,
            message: 'User was registered successfully!'
        })
    } catch(error){
        console.error(error)
        res.status(500).json({message: 'Erreur lors de la connexion', error: error.message})
    }
}


const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const jwtSecret = config.secret || "default_secret";

exports.googleOAuthRedirect = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Code d'autorisation manquant.");
    }

    const response = await axios.post(GOOGLE_TOKEN_URL, null, {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URL,
        grant_type: "authorization_code",
        code,
      },
    });

    const accessToken = response.data.access_token;
    if (!accessToken) {
      return res.status(400).send("Impossible d'obtenir un token d'accès.");
    }

    const userData = await axios.get(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log("data : ", userData.data)

    const { name, email, picture } = userData.data;
    
    const fullName = name.split(" ")
    const prenomUser = fullName[0]
    const nomUser = fullName[1]

    let user = await User.findOne({ email: email });
    if (!user) {
      user = new User({
        prenom: prenomUser,
        nom: nomUser || "Utilisateur Google",
        email: email,
        username: name,
        password: crypto.randomBytes(16).toString("hex"), 
        profile_picture: picture,
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, password: user.password },
      jwtSecret,
      { algorithm: "HS256", expiresIn: "24h" }
    );
 
    res.cookie("access_token", token, { httpOnly: true, secure: false });
    res.redirect(`http://localhost:5173/?token=${token}`);
  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).send("Erreur interne du serveur");
  }  
};


exports.signout = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.send({message: 'Logged out successfully!'});
}