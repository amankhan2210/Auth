const mongoose = require('mongoose')


const SessionSchema = new mongoose.Schema({
    user :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true,"User is required"]
    },
    refreshTokenHash:{
        type : String,
        required : [true,"Refresh token hash is required"]
    },
    ip:{
        type : String,
        required : [true,'IP address is required']
    },
    useragent:{
        type : String,
        required : [true,'useragent is required']
    },
    revoked : {
        type : Boolean,
        default : false
    },
},{timestamps : true})



const Session =mongoose.model("Session",SessionSchema)
module.exports = Session