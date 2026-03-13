import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import crypto from "crypto";


const sendMail = async (options) => {
    const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        
        name: 'taskmanager',
        link: 'https://mailgen.js/'
        
    }

});

    const emailHTMLBody = mailGenerator.generate(options.MailGencontent);
    const emailPlainBody = mailGenerator.generate(options.MailGencontent);



const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: process.env.MAILTRAP_SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },
});


const mail = {
    from: 'mail.taskmanager@example.com',
    to: options.email,
    subject: options.subject,
    text: emailPlainBody, 
    html: emailHTMLBody,
}

try {
    await transporter.sendMail(mail)
} catch (error) {
    console.log("Email failed", error);
    
}

}

const emailVerificationMailGenContent = (name, emailVerificationURL) => {
    return {
        body: {
            name: name,
             intro: 'Welcome to our app! We\'re very excited to have you on board.',
        action: {
            instructions: 'To verify your account, please click here:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Verify your account',
                link: emailVerificationURL
        }
    },
    outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}


const resetPasswordMailGenContent = (name, resetPasswordURL) => {
    return {
        body: {
            name:name,
             intro: 'Welcome to our app! We\'re very excited to have you on board.',
        action: {
            instructions: 'To reset your password, please click here:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Reset your password',
                link: resetPasswordURL
        }
    },
    outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}




export {sendMail, emailVerificationMailGenContent, resetPasswordMailGenContent}