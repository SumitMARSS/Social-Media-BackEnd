
//otp varification

const otpGenerator = require("otp-generator");
const user = require("../models/user");
const otp = require("../models/otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");

require("dotenv").config();

// -> testing done

exports.sendOtp = async (req, res) => {
    try {
        const {email} = req.body;

        const checkUniqueUser = await user.findOne({email});
        if(checkUniqueUser){
            res.status(401).json({
                success:false,
                message:'User already exists',
            })
        }

        //we have unique user generate otp
        var newOtp = otpGenerator.generate(6, {
            lowerCaseAlphabets:false,
            upperCaseAlphabets:false,
            specialChars:false,
        });

        console.log("OTP IS ", newOtp);

    //worst code -> Here we can optimize and can use a directly third party which generate unique code each time


        //check for unique otp
        let result = await otp.findOne({otp:newOtp});
        while(result){
            opt = otpGenerator.generate(6, {
                lowerCaseAlphabets:false,
                upperCaseAlphabets:false,
                specialChars:false,
            });
            //if already otp exist then regenerate
            result = await otp.findOne({otp:newOtp});
        }

        ////////////////////////////////////

        // create a db entry for otp
        const otpPayLoad = {email, newOtp};    //time is taken by default
        const otpBody = await otp.create(otpPayLoad);
        console.log(otpBody);

        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            opt:newOtp,
        });

        
    } catch (err) {
        console.log(err);
        console.log("Error in sending OTP at auth");
        res.status(500).json({
            success:false,
            message:"Error in sending OTP at auth",
            message:err.message
        });
    };
}

// signUp  -> testing done

exports.signUp = async (req, res) => {
    try {

        //data fetching from req
        const { name, email, password, confirmPassword, otp } = req.body;

        //validate data
        if( !name || !email || !password || !confirmPassword || !otp ){
            res.status(403).json({
                success:false,
                message:'Please, fill all required details.',
            });
        };
        //2 password match
        if(password !== confirmPassword){
            res.status(401).json({
                status:false,
                message:'Make sure to fill password and confirm password correctly',
            });
        };
        //check for unique user
        const existingUser = await user.findOne({email});
        if(existingUser){
            res.status(401).json({
                status:false,
                message:'Please login, as email is already registered',
            })
        };
        //resent opt fetch stored in user
        let response = await otp.find({email}).sort({createdAt:-1}).limit(1);
        console.log(response);
        //validate otp
        if( response.length === 0 ){
            //opt not found
            res.status(401).json({
                status:false,
                message:'OTP not found.',
            })
        } 
        else if(otp !== response[0].otp){
            res.status(401).json({
                status:false,
                message:'Please enter correct otp',
            })
        }
        //hash password
        const hashPassword = await bcrypt.hash(password, 10);

        //create a DB entry
        const user = await user.create({
            name,
            password:hashPassword,
            email,
            avatar:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        //sent a successfull response
        res.status(200).json({
            success:true,
            message:'Sign Up successfully, Thank you for signUp',
            user,
        }); 
        
    } catch (err) {
        console.log(err);
        console.log("Error while procedding for signUp");
        return res.status(500).json({
            success:false,
            message:'Error, Check the signUp Auth ',
            error:err
        })
    }
}


// login  -> testing done

exports.login = async (req, res) => {
    try {
        //fetch data
        const { email, password } = req.body;
        //validate data
        if( !email || !password ){
            return res.status(401).json({
                status:false,
                message:'Please fill the nessary details',
            });
        } 
        //check whether registered email or not

        // chances of mistake if you don't populate additional details then how
        // you will render in dashboard
        const user = await user.findOne({email}); 
        if( !user ){
            return res.status(401).json({
                status:false,
                message:'Please sign Up first',
            });
        }

        // now we have registered user check for password
        
        const validation = await bcrypt.compare(password, user.password );
        if( !validation){
            return res.status(401).json({
                status:false,
                message:'Enter correct password',
            });
        }

        // generate jawascript web token(JWT) 

        const payload = {
            email:user.email,
            _id:user._id,
            role:user.accountType,
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        user.token = token;
        user.password = undefined;

        const options = {
            expires: new Date(Date.now() + 24*60*60*1000 ),
            httpOnly:true,
        }

        // generate cokkies
        res.cookie('token', token, options).status(200).json({
            success:true,
            token,
            user,
            message:'Successfully logged In',
        });

    } catch (err) {
        console.log(err);
        console.log("Error while procedding for login");
        return res.status(500).json({ 
            success:false,
            message:'Error while procedding for login, try again later',
            error:err,
        })
    }
}


//change password

// we have steps like
// 1. fetch detail from req -> old pasword, new passoword, confirm new password

// -> testing done

exports.changePassword = async (req, res) => {
    try {
        // fetch details
        // const { email, oldPassword, newPassword, confirmNewPassword} = req.body();
        const {  oldPassword, newPassword} = req.body;

        //check for any null value
        if( !oldPassword || !newPassword  ){
            return res.status(402).json({
                success:false,
                message:'Please fill all mendatory details',
            })
        } 
        
        const id = req.user._id;  // we are getting from payload but how??
        //because of auth we are decoding it and after decode we put it into req.user so we can access that
        const userDetails = await user.findById(id);
        // check for their old password is correct
        const isPasswordMatch = await bcrypt.compare( oldPassword, userDetails.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                success:false,
                message:'Please enter correct old password',
            })
        }

        // bcrypt the newpassword
        //hash password
        const hashPassword = await bcrypt.hash(newPassword, 10);

        //user.password = hashPassword.save();
        const updatedUserDetails = await user.findByIdAndUpdate({_id:id},
            {
                password:hashPassword,
            }, {new:true});

        //sending mail for confirmation
        try { 
            const mailResponse = await mailSender(
                updatedUserDetails.email, 
                "Password Update for your account", 
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.name}`
                ))
            console.log("Password changed ", mailResponse.response);

        } catch (err) {
            console.log("Error in sending mail");
            console.log(err);
            return res.status(402).json({
                success:false,
                message:'Error while sending mail',
                error:err
            })
        }

        return res.status(200).json({
            success:true,
            message:'Password changed successfully, login again',
        })

    } catch (err) {
        console.log('Error while changing password', err);
        return res.status(500).json({
            success:false,
            message:err,
            detail:'Error while changing password',
        })
    }
}

// logout

exports.logout = async (req, res) => {
    try {
        const id = req.user._id;

        // if we didn't get id
        if(!id){
            return res.status(402).json({
                success:false,
                message:"No one logged in to Logout"
            })
        }

        const updateUser = await user.findByIdAndUpdate(id, {
            token:null,
        },{new:true});

        res.status(200)
        .cookie("token", null, {expires: new Date(Date.now()), httpOnly: true})
        .json({
            success:true,
            message:"Logged Out Successfully",
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message:"Error while performing logout operation",
        });
    }
}