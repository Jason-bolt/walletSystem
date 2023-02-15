const nodemailer = require("nodemailer");

/**
 * @class EmailHelper
 */
class EmailHelper {
  constructor() {
    senderEmail = "info@walletsystemcom";
  }

  /**
   *
   * @param {Object} param0 - Object containing user emai, subject and text
   * @returns {Promise<object>}
   */
  static async sendMail({ email, subject, text }) {
    const transport = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
    try {
      let info = await transport.sendMail({
        from: this.senderEmail, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
      });
      return info;
    } catch (err) {
      return { error: err };
    }
  }

  //   static async sendRegistrationSuccessMail(payload){
  //     try {
  //         const {email, subject, text} = payload
  //         const messageSent = await EmailHelper.sendMail(email, subject, text)
  //         if
  //     } catch (err) {

  //     }
  //   }
}

export default EmailHelper;
