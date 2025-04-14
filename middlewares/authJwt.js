const jwt = require("jsonwebtoken");
const config = require("../config/keys.js");
const User = require("../models/users.js");

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if(!token){
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if(err){
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        next();
    })
}

isExist = async (req, res, next) => {
    const user = await User.findById(req.userId);
    console.log(req.userId)
    
    if(!user){
        return res.status(403).send({ message: "User not found"})
    }

    next()
}

const authJwt = {
    verifyToken, 
    isExist,
}

module.exports = authJwt;