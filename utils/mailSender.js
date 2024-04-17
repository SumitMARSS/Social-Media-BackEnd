
const nodemailer = require("nodemailer");
require("dotenv").config();


const mailSender = async ( email, title, body) => {
    try {
        // Create a transporter to send emails
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            // Define the email options
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        });

        // Send the email
        let info = await transporter.sendMail({
            from: `Social Media `,
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
        })

        console.log(info);//just for safty purpose print at console
        return info;
        
    } catch (err) {
        console.log("Error in sending mail -> mailsender");
        console.log(err.message);
    }
}

module.exports = mailSender;







