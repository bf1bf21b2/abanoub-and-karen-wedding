const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");

exports.sendInvitation = onDocumentCreated(
  {
    document: "guests/{guestId}",
    secrets: [SMTP_USER, SMTP_PASS],
    region: "europe-west1",
  },
  async (event) => {
    const data = event.data?.data();

    if (!data || !data.email) {
      logger.error("No guest email found.");
      return;
    }

    const email = data.email;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_USER.value(),
        pass: SMTP_PASS.value(),
      },
    });

    await transporter.sendMail({
      from: `"Abanoub & Karen Wedding" <${SMTP_USER.value()}>`,
      to: email,
      subject: "Your Wedding Invitation ❤️",
      text: "Thank you for being part of our special day. Please find your invitation attached.",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.7">
          <h2>Abanoub &amp; Karen ❤️</h2>
          <p>Thank you for being part of our special day.</p>
          <p>Your wedding invitation is attached to this email.</p>
          <p>We can't wait to celebrate with you!</p>
        </div>
      `,
      attachments: [
        {
          filename: "invitation.pdf",
          path: "../../assets/invitation.pdf",
        },
      ],
    });

    logger.info(`Invitation sent to ${email}`);
  }
);