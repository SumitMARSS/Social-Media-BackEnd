
const user = require("../models/user");
const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
    try {
        
        //extract the token from either one of them
        //1. from body, 2. from cookies 3. from barrer best way-> 3 avoid body -
        // ********** face problem during connection as Authorization - Authorisation   *******
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");

        if( !token ){
            return res.status(401).json({
                success:false,
                message:"No token exists",
            })
        } 
        
        //match the token 
        try {
            //verify
            const decode = await jwt.verify(token, process.env.JWT_SECRET );
            console.log(decode);
            req.user = decode;  //here we have email, id, role
        } catch (err) {
            console.log("Incorrect token", err);
            return res.status(401).json({
                success:false,
                message:'Token is invalid',
            })
        }

        next(); // go to next middleware

    } catch (err) {
        console.log("Error while performing auth middleware");
        return res.status(500).json({
            success:false,
            message:"Error while performing auth middleware",
            error:err,
        })
    }
}