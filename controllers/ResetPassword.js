
// reset password token

const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// resetPasswordToken -> tested

exports.resetPasswordToken = async (req, res) => {
   
    try {
        
        //get email from requrst body
        const email = req.body.email;
        //check for valid user
        const validation = await User.findOne({email:email});

        if(!validation){
            return res.status(402).json({
                success:false,
                message:'No user exists',
            })
        }

        //generate tokens
        const token = crypto.randomBytes(20).toString("hex");
        //update the details
        const updateDetails = await User.findOneAndUpdate(
                        {email:email},
                        {
                            token:token,
                            resetPasswordExpires: Date.now() + 5*60*1000,
                        },
                        {new:true});

        console.log("updated user details",updateDetails);
        //generate url on the basis of token 
        const url = `https://localhost:3000/udate-reset-password/${token}`;
        
        //sending mails
        const mail = await mailSender(email, "Reset Password Link ", `Reset Password Link for update password: ${url}`);
        console.log(mail);

        return res.status(200).json({
            success:true,
            message:'Email sended successfully, Please check email.',
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success:false,
            message:'Error occur while generating reset password token',
            error:err.message,
        })
    };
}


//reset password -> tested

exports.resetPassword = async (req, res) => {
    
    try {
        // data fetched
        const {password, confirmPassword, token } = req.body;
        //check if present
        if(!password || !confirmPassword || !token ){
            return res.status(402).json({
                success:false,
                message:'Please fill all details',
            })
        };

        if(password !== confirmPassword){
            return res.status(402).json({
                success:false,
                message:"Enter same parameters in password and confirm password",
            })
        }; 

        //get user details from db
        const user = await User.findOne({token:token});
        //if no user
        if(!user){
            return res.status(402).json({
                success:false,
                message:'User does not exists',
            })
        };

        //check for token time valid or not
        if(user.resetPasswordExpires < Date.now() ){
            return res.status(402).json({
                success:false,
                message:'Token expired, Please regerate the token',
            })
        };

        //hash password
        const hashPassword = await bcrypt.hash(password, 10);

        //update in db
        await User.findOneAndUpdate({token:token}, {password:hashPassword}, {new:true});
        //return response for successfull update
        return res.status(200).json({
            success:true,
            message:'Password updated successfully',
        });

    //check for valid user
    } catch (err) {
        console.log("Error while reset password");
        return res.status(500).json({
            success:false,
            message:'Paswword reset is not working, plases try later',
        })
    };

}