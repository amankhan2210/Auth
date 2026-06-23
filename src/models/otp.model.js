const mongoose = require('mongoose')

const otpShema = new mongoose.Schema({
    email : {
        type: String,
        required : [true,"Email is required"]
    },
    user :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true,"user is required"]
    },
    otpHash:{
        type:String,
        required : [true,"Otp Hash is required"]
    },
    expiresAt:{
        type : Date,
        required : [true,"expiresAt required"]
    }
},{timeseries : true})

const otpModel = mongoose.model('otpModel',otpShema)
module.exports =otpModel