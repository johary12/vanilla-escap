// src/lib/emailService.js
import nodemailer from 'nodemailer'

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: import.meta.env.VITE_SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(import.meta.env.VITE_SMTP_PORT || '465'),
  secure: import.meta.env.VITE_SMTP_SECURE === 'true',
  auth: {
    user: import.meta.env.VITE_SMTP_USER || 'joharyandriana86@gmail.com',
    pass: import.meta.env.VITE_SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})

// Vérifier la connexion SMTP
export const verifySMTPConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ SMTP connecté avec succès')
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur SMTP:', error)
    return { success: false, error: error.message }
  }
}

// Envoyer un email
export const sendEmailSMTP = async (options) => {
  try {
    const mailOptions = {
      from: `"Vanilla Escape" <${import.meta.env.VITE_SMTP_USER || 'joharyandriana86@gmail.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html || options.message,
      text: options.text || options.message,
      replyTo: options.replyTo || 'contact@vanilla-escape.com'
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email envoyé:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return { success: false, error: error.message }
  }
}

// Créer un template d'email HTML
export const createEmailTemplate = (data) => {
  const { to_name, message, subject } = data

  return {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1b4332; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1b4332; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
          .signature { margin-top: 20px; }
          .highlight { color: #1b4332; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 Vanilla Escape</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 16px;">
            Bonjour <strong>${to_name}</strong>,
          </p>
          
          <div class="message-box">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <div class="signature">
            <p style="margin: 0;">
              Cordialement,<br>
              <strong style="color: #1b4332;">L'équipe Vanilla Escape</strong>
            </p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">
              Agence réceptive à Madagascar<br>
              📧 contact@vanilla-escape.com | 📞 +261 38 25 955 00
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>
            Cet email a été envoyé depuis l'administration de Vanilla Escape.<br>
            <span style="color: #999;">Ne répondez pas à cet email, utilisez notre formulaire de contact.</span>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
      Bonjour ${to_name},

      ${message}

      Cordialement,
      L'équipe Vanilla Escape

      ---
      Agence réceptive à Madagascar
      Email: contact@vanilla-escape.com
      Tél: +261 38 25 955 00
    `
  }
}