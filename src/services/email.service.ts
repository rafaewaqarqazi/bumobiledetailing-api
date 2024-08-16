import nodeMailer from 'nodemailer';
import fs from 'fs';
import { config } from '../config';
interface IEmailData {
  from?: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  attachments?: any;
  list?: any;
}
export const sendEmail = (emailData: IEmailData, withPromise = false) => {
  const transporter = nodeMailer.createTransport({
    host: config.smtpService,
    port: 465,
    secure: true,
    auth: {
      user: config.smtpLoginEmail,
      pass: config.smtpPassword,
    },
  });
  // return new Promise(() => {});
  const options = {
    ...emailData,
    ...(config.DEV
      ? { to: 'rafaewaqar@gmail.com' }
      : {}),
  };
  if (withPromise) {
    return transporter.sendMail(options);
  }
  return transporter
    .sendMail(options)
    .then((info) =>
      console.log(`Message sent: ${info.response} to: ${options.to}`)
    )
    .catch((err) => console.log(`Problem sending email: ${err}`));
};
export const readHTMLFile = (path: string) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
};
