const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => {"Database connected successfully"})
    .catch((err) => {
        console.log("Error in DB connection", err);
        console.log(err.message);
        process.exit(1);
    })
}
