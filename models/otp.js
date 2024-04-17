const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplates = require("../mail/emailVerification");

const OtpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:5*60,   //expire in 5 min
    },
});

//sending the mail
async function sendVerificationDetail(email, otp) {

    try {
        const mailResponse = await mailSender(email, "Verification mail from Social Media",emailTemplates(otp));
        console.log("Email sent successfully : ", mailResponse);
    } catch (err) {
        console.log("Error occured while sending mail: ", err);
        throw err;
    }
};


//we have to add a pre-midware just to call when a person want to signUp

OtpSchema.pre("save", async function(next) {
    await sendVerificationDetail(this.email, this.otp);
    next();
});

module.exports = mongoose.model("OTP", OtpSchema);