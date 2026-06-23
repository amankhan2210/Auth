const crypto = require("crypto");
const sendEmail = require('../services/email.services')

async function SendGenOtp(email,username) {

    const otp =  crypto.randomInt(100000, 1000000).toString();
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
                            Hello 👋 ${username}
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
    return otp
}


module.exports = SendGenOtp