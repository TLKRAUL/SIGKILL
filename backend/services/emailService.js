// ===== SIGKILL Email Service — Gmail SMTP =====
const nodemailer = require('nodemailer');

// Configurare transporter Gmail
function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('⚠️  GMAIL_USER sau GMAIL_APP_PASSWORD nu sunt setate în .env');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

// ===== Trimite email generic =====
async function sendEmail({ to, subject, text, html }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('📧 Email SIMULAT (nu e configurat SMTP):');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body: ${text?.substring(0, 100)}...`);
    return { success: false, reason: 'SMTP not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"SIGKILL" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`📧 Email trimis: ${to} — ${subject} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Eroare email:', error.message);
    return { success: false, error: error.message };
  }
}

// ===== Email: Bun venit (Register) =====
async function sendWelcomeEmail(name, email) {
  return sendEmail({
    to: email,
    subject: '👋 Bun venit la SIGKILL!',
    text: `Salut ${name}!\n\nContul tău SIGKILL a fost creat cu succes.\nAi 3 zile gratuite să testezi toate funcțiile.\n\nCe poți face:\n• Scanează bonuri și facturi cu AI\n• Gestionează-ți cămara inteligent\n• Primește rețete din ce ai acasă\n• Bugetare și alerte de expirare\n\nMult succes!\nEchipa SIGKILL ⚡`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px;">⚡</span>
          <h1 style="font-size: 20px; color: #1a1a2e; margin: 8px 0 4px;">Bun venit, ${name}!</h1>
          <p style="font-size: 13px; color: #9a9ab0;">Contul tău SIGKILL e gata</p>
        </div>
        <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #2563eb;">
          <p style="font-size: 14px; color: #1a1a2e; margin: 0 0 4px; font-weight: 600;">🎁 Ai 3 zile gratuite!</p>
          <p style="font-size: 13px; color: #5a5a72; margin: 0;">Testează toate funcțiile fără restricții.</p>
        </div>
        <div style="margin-bottom: 20px;">
          <p style="font-size: 13px; color: #5a5a72; margin: 0 0 12px;">Ce poți face:</p>
          <p style="font-size: 13px; color: #1a1a2e; margin: 4px 0;">📷 Scanează bonuri și facturi cu AI</p>
          <p style="font-size: 13px; color: #1a1a2e; margin: 4px 0;">🍳 Gestionează cămara inteligent</p>
          <p style="font-size: 13px; color: #1a1a2e; margin: 4px 0;">🤖 Primește rețete din ce ai acasă</p>
          <p style="font-size: 13px; color: #1a1a2e; margin: 4px 0;">💰 Bugetare și alerte de expirare</p>
        </div>
        <div style="text-align: center;">
          <a href="http://localhost:5173/dashboard" style="display: inline-block; padding: 12px 28px; background: rgba(37,99,235,0.1); color: #2563eb; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid rgba(37,99,235,0.2);">
            Intră în aplicație →
          </a>
        </div>
        <p style="text-align: center; font-size: 11px; color: #9a9ab0; margin-top: 24px;">
          Echipa SIGKILL ⚡ · 2026
        </p>
      </div>
    `,
  });
}

// ===== Email: Cerere Enterprise =====
async function sendEnterpriseRequestEmail({ company, seats, email, phone, message }) {
  // Email intern — notifică echipa
  const internalResult = await sendEmail({
    to: process.env.GMAIL_USER, // trimite la propriul email
    subject: `🏢 Cerere Enterprise: ${company} (${seats} persoane)`,
    text: `Nouă cerere Enterprise!\n\nCompanie: ${company}\nNr. persoane: ${seats}\nEmail: ${email}\nTelefon: ${phone || 'N/A'}\nMesaj: ${message || 'N/A'}\n\nResponde cât mai repede!`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #eee;">
        <h2 style="font-size: 18px; color: #1a1a2e; margin: 0 0 20px;">🏢 Cerere Enterprise nouă</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-size: 13px; color: #9a9ab0;">Companie</td><td style="padding: 8px 0; font-size: 14px; color: #1a1a2e; font-weight: 600;">${company}</td></tr>
          <tr><td style="padding: 8px 0; font-size: 13px; color: #9a9ab0;">Nr. persoane</td><td style="padding: 8px 0; font-size: 14px; color: #1a1a2e; font-weight: 600;">${seats}</td></tr>
          <tr><td style="padding: 8px 0; font-size: 13px; color: #9a9ab0;">Email</td><td style="padding: 8px 0; font-size: 14px; color: #2563eb;">${email}</td></tr>
          <tr><td style="padding: 8px 0; font-size: 13px; color: #9a9ab0;">Telefon</td><td style="padding: 8px 0; font-size: 14px; color: #1a1a2e;">${phone || 'N/A'}</td></tr>
          ${message ? `<tr><td style="padding: 8px 0; font-size: 13px; color: #9a9ab0;">Mesaj</td><td style="padding: 8px 0; font-size: 14px; color: #1a1a2e;">${message}</td></tr>` : ''}
        </table>
        <div style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 8px;">
          <p style="font-size: 12px; color: #d97706; margin: 0;">⚡ Răspunde în max 24h</p>
        </div>
      </div>
    `,
  });

  // Email confirmare — trimite clientului
  const clientResult = await sendEmail({
    to: email,
    subject: '✅ Am primit cererea ta — SIGKILL Enterprise',
    text: `Salut!\n\nAm primit cererea ta pentru pachetul Enterprise.\n\nCompanie: ${company}\nNr. persoane: ${seats}\n\nTe contactăm în maxim 24 de ore cu o ofertă personalizată.\n\nMulțumim!\nEchipa SIGKILL ⚡`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px;">🏢</span>
          <h1 style="font-size: 20px; color: #1a1a2e; margin: 8px 0 4px;">Cerere primită!</h1>
          <p style="font-size: 13px; color: #9a9ab0;">Te contactăm în maxim 24h</p>
        </div>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin-bottom: 16px; border-left: 4px solid #16a34a;">
          <p style="font-size: 14px; color: #1a1a2e; margin: 0;"><strong>${company}</strong> · ${seats} persoane</p>
        </div>
        <p style="font-size: 13px; color: #5a5a72; line-height: 1.6;">
          Echipa noastră pregătește o ofertă personalizată pentru tine. 
          Vei primi un email cu detaliile în curând.
        </p>
        <p style="text-align: center; font-size: 11px; color: #9a9ab0; margin-top: 24px;">
          Echipa SIGKILL ⚡ · 2026
        </p>
      </div>
    `,
  });

  return { internal: internalResult, client: clientResult };
}

// ===== Email: Confirmare activare plan =====
async function sendPlanActivatedEmail(name, email, planName, price) {
  return sendEmail({
    to: email,
    subject: `🎉 Pachetul ${planName} a fost activat!`,
    text: `Salut ${name}!\n\nPachetul ${planName} (${price} RON/lună) a fost activat cu succes.\n\nBucură-te de toate funcțiile premium!\n\nEchipa SIGKILL ⚡`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px;">🎉</span>
          <h1 style="font-size: 20px; color: #1a1a2e; margin: 12px 0 4px;">Plan activat!</h1>
        </div>
        <div style="background: #ede9fe; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <p style="font-size: 24px; font-weight: 800; color: #7c3aed; margin: 0;">${planName}</p>
          ${price ? `<p style="font-size: 14px; color: #5a5a72; margin: 4px 0 0;">${price} RON / lună</p>` : ''}
        </div>
        <p style="font-size: 13px; color: #5a5a72; text-align: center;">
          Salut ${name}, bucură-te de toate funcțiile premium! ⚡
        </p>
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEnterpriseRequestEmail,
  sendPlanActivatedEmail,
};
