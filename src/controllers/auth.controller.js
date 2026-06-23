const User = require('../models/user.model')
const Session = require('../models/session.model')
const otpModel = require('../models/otp.model')
const sendEmail = require('../services/email.services')
const SendGenOtp = require('../utils/utils')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// CHECKING THE MAIL IS WORKING OR NOT 
async function sendMailToUser(req, res) {
    try {
        const { email } = req.body;
        const otp = 53211;
        const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OTP Verification</title>
</head>
<body style="
    margin:0;
    padding:0;
    background:#0f172a;
    font-family:Arial, Helvetica, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td align="center" style="padding:40px 20px;">

            <table width="600" cellpadding="0" cellspacing="0" style="
                background:#1e1b4b;
                border-radius:20px;
                overflow:hidden;
                box-shadow:0 10px 30px rgba(139,92,246,0.3);
            ">

                <!-- Header -->
                <tr>
                    <td align="center" style="
                        background:linear-gradient(135deg,#7c3aed,#a855f7);
                        padding:35px;
                    ">
                        <h1 style="
                            margin:0;
                            color:white;
                            font-size:32px;
                        ">
                            🔐 Verify Your Account
                        </h1>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:40px;">

                        <h2 style="
                            color:white;
                            margin-top:0;
                        ">
                            Hello 👋
                        </h2>

                        <p style="
                            color:#cbd5e1;
                            font-size:16px;
                            line-height:1.7;
                        ">
                            Use the verification code below to complete your authentication.
                        </p>

                        <!-- OTP Box -->
                        <div style="text-align:center;margin:40px 0;">

                            <div style="
                                display:inline-block;
                                padding:20px 40px;
                                border-radius:14px;
                                background:#312e81;
                                border:2px solid #8b5cf6;
                                color:#c4b5fd;
                                font-size:36px;
                                font-weight:bold;
                                letter-spacing:10px;
                                box-shadow:0 0 20px rgba(139,92,246,0.5);
                            ">
                                ${otp}
                            </div>

                        </div>

                        <p style="
                            color:#cbd5e1;
                            font-size:15px;
                        ">
                            ⏳ This OTP will expire in
                            <strong style="color:#a78bfa;">
                                10 minutes
                            </strong>.
                        </p>

                        <p style="
                            color:#94a3b8;
                            font-size:14px;
                            margin-top:25px;
                        ">
                            If you did not request this verification code,
                            you can safely ignore this email.
                        </p>

                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td align="center" style="
                        background:#111827;
                        padding:20px;
                    ">
                        <p style="
                            margin:0;
                            color:#9ca3af;
                            font-size:13px;
                        ">
                            © 2026 Your App • Secure Authentication System
                        </p>
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>`
        await sendEmail(
            email,
            "Verify Your Email",
            `Your OTP is ${otp}`,
            htmlTemplate
        );
        res.status(200).json({
            success: true,
            message: "Email sent successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to send email"
        });
    }
}


async function register(req,res){
    
    const{username,email,password} = req.body
    const isUserAlreadyExits = await User.findOne({email})
    if(isUserAlreadyExits){
        return res.status(409).json({
            msg : "User Already exits"
        })
    }

    const hashedPassword = await bcrypt.hash(password,10)
    const user = await User.create({
        username,
        email,
        password : hashedPassword
    })

    // const refreshToken = jwt.sign({
    //     id : user._id,
    //     email : user.email,
    // },process.env.JWT_SECRET,{
    //     expiresIn : '7d'
    // })
    // const refreshTokenHash = crypto.createHash("md5").update(refreshToken).digest("hex")
    // const session = await Session.create({
    //     user : user._id,
    //     refreshTokenHash : refreshTokenHash,
    //     ip : req.ip,
    //     useragent : req.headers['user-agent']
    // })
    // const accessToken = jwt.sign({
    //     id : user._id,
    //     sessionId : session._id,
    //     email : user.email,
    // },process.env.JWT_SECRET,{
    //     expiresIn : '15m'
    // })
    // res.cookie("refreshToken",refreshToken,{
    //     httpOnly : true,
    //     secure : true,
    //     sameSite : "strict",
    //     maxAge : 7 * 24 * 60 * 60 * 1000
    // })

    const otp = await SendGenOtp(email,username)
    const otpHash = await bcrypt.hash(otp,10)
    await otpModel.create({
        email,
        user : user._id,
        otpHash,
        // otp expired in 10 min
        expiresAt :new Date(Date.now() + 10 * 60 * 1000)
    })

    res.status(201).json({
        msg : "User created successfully and OTP Send done",
        user :{
            id : user._id,
            name : user.username,
            email : user.email,
            verified : user.verified,
            otp: otp
        },
    })
    
}



async function refreshToken(req,res) {
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){
        return res.status(409).json({
            msg : "Unauthorized--Token not present in cookie"
        })
    }
    try {

    const refreshTokenHash = crypto.createHash("md5").update(refreshToken).digest("hex")
    const session = await Session.findOne({
        refreshTokenHash,
        revoked : false
    })

    if(!session){
        return res.status(401).json({
            msg : "Invalid refresh token"
        })
    }

    const decoded = jwt.verify(refreshToken,process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    const accessToken = jwt.sign({
        id : user._id,
        sessionID : session._id,
        email : user.email,
    },process.env.JWT_SECRET,{
        expiresIn : '15m'
    })

    const newrefreshToken = jwt.sign({
        id : user._id,
        email : user.email,
    },process.env.JWT_SECRET,{
        expiresIn : '7d'
    })

    const newRefreshTokenHash = crypto.createHash("md5").update(newrefreshToken).digest("hex")
    session.refreshTokenHash = newRefreshTokenHash
    await session.save()

    res.cookie("refreshToken",newrefreshToken,{
    httpOnly : true,
    secure : true,
    sameSite : "strict",
    maxAge : 7 * 24 * 60 * 60 * 1000
    })


    res.status(200).json({
        msg : "Refresh of token done succesfully",
        email : user.email,
        user : user.username,
        NewaccessToken : accessToken,
        NewrefreshToken : newrefreshToken
    })        
    } catch (error) {
        res.status(409).json({
            msg : "WRONG TOKEN"
        })
    }

}

async function logout(req,res) {
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){
        return  res.status(200).json({
        msg : 'Token not present in cookie'
            })
    }

    const refreshTokenHash = crypto.createHash("md5").update(refreshToken).digest("hex")
    const session = await Session.findOne({
        refreshTokenHash,
        revoked : false
    })

    if(!session){
        return res.status(409).json({
            msg : "Invalid refresh token"
        })
    }

    session.revoked = true
    await session.save()
    res.clearCookie('refreshToken')
    res.status(200).json({
        msg : 'Logout successful'
    })
}

async function logoutall(req,res){
    
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){
        return  res.status(409).json({
        msg : 'Token not found in cookie'
        })
    }
    const decoded = jwt.verify(refreshToken,process.env.JWT_SECRET)
    await Session.updateMany({
        user : decoded.id,
        revoked :false
    },{
        revoked : true
    })
    res.clearCookie("refreshToken")
    res.status(200).json({
        msg : 'Logout successfull From all device'
    })

}


async function login(req,res){
    
    const {email,password} = req.body
    const user = await User.findOne({email})
    if(!user){
        return res.status(409).json({
            msg :  'User is not Found'
        })
    }
    if(!user.verified){
        return res.status(409).json({
            msg : 'User is Not verifed Plz verify'
        })
    }
    // const isPassword = user.password === crypto.createHash('sha256').update(password).digest('hex')
    const isPassword =  await bcrypt.compare(password,user.password)
    if(!isPassword){
        return res.status(409).json({
            msg : 'Email And Password is Wrong'
        })
    }

    const refreshToken = jwt.sign({
        id : user._id,
        email : user.email
    },process.env.JWT_SECRET,{
        expiresIn : '7d'
    })
    const refreshTokenHash = crypto.createHash("md5").update(refreshToken).digest("hex")
    const session = await Session.create({
        user : user._id,
        refreshTokenHash,
        ip : req.ip,
        useragent : req.headers['user-agent']
    })

    const accessToken = jwt.sign({
        id : user._id,
        email : user.email,
        sessionID : session._id,
    },process.env.JWT_SECRET,{
        expiresIn : '15m'
    })

    res.cookie("refreshToken",refreshToken,{
    httpOnly : true,
    secure : true,
    sameSite : "strict",
    maxAge : 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        msg : "Login Successfully",
        user,
        accessToken,
        refreshToken
    })
}


async function verifyEmail(req,res) {
   const {otp,email} = req.body
   const otpDoc = await otpModel.findOne({email})
   if(!otpDoc){
    return res.status(400).json({
        msg : 'Invlaid Otp'
    })
   }
   const isMatch = await bcrypt.compare(otp,otpDoc.otpHash)
   if(!isMatch){
    return res.status(400).json({msg : 'Invlaid Otp'})
   }
   if(otpDoc.expiresAt <new Date()){
    await otpModel.deleteMany({
        email : otpDoc.email
    })
    return res.status(400).json({
        msg: "OTP Expired"
    });
   }

   const user = await User.findByIdAndUpdate(otpDoc.user,{
    verified : true
   })
   await otpModel.deleteMany({
    email : otpDoc.email
   })

   return res.status(200).json({
    msg : 'Email is Verifed Successfully',
    username : user.username,
    email : user.email,
   })

}



async function getme(req,res){
    const token = req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            msg : "Unauthorized"
        })
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
        res.status(200).json({
            msg : "User fetched successfully",
            user : {
                id : user._id,
                name : user.username,
                email : user.email,
                password : user.password
            }
        })
    }
    catch (error) {
        return res.status(401).json({
            msg : " Invalid Token"
        })
    }
}




module.exports = {
    register,
    getme,
    refreshToken,
    logout,
    logoutall,
    login,
    sendMailToUser,
    verifyEmail
}