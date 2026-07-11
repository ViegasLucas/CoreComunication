const { auth } = require('../config/firebase');
const nodemailer = require('nodemailer');

/**
 * Template HTML do e-mail de redefinição de senha.
 * Segue a identidade visual do ClearIT (dark mode, gradientes indigo/blue).
 */
const buildResetEmailHtml = (userName, resetUrl) => {
  const name = userName || 'usuário';
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha — ClearIT</title>
</head>
<body style="margin:0; padding:0; background-color:#0a101f; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; -webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0a101f; padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px; width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background: linear-gradient(135deg, #4f46e5, #6366f1); border-radius:14px; padding:12px 16px;">
                    <span style="color:#ffffff; font-size:20px; font-weight:700; letter-spacing:-0.3px;">ClearIT</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card principal -->
          <tr>
            <td style="background-color:#111827; border-radius:20px; border:1px solid #1e293b; overflow:hidden;">

              <!-- Barra gradiente no topo -->
              <div style="height:4px; background:linear-gradient(90deg, #4f46e5, #3b82f6, #06b6d4);"></div>

              <!-- Conteúdo -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 36px;">
                <tr>
                  <td>
                    <!-- Ícone de cadeado -->
                    <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
                      <tr>
                        <td style="background-color:rgba(79,70,229,0.15); border-radius:14px; padding:14px; border:1px solid rgba(99,102,241,0.2);">
                          <img src="https://img.icons8.com/sf-regular-filled/48/818cf8/lock-2.png" width="28" height="28" alt="🔐" style="display:block;" />
                        </td>
                      </tr>
                    </table>

                    <h1 style="color:#f1f5f9; font-size:24px; font-weight:700; margin:0 0 12px; line-height:1.3;">
                      Redefinição de Senha
                    </h1>

                    <p style="color:#94a3b8; font-size:15px; line-height:1.7; margin:0 0 28px;">
                      Olá, <strong style="color:#e2e8f0;">${name}</strong>.<br>
                      Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color:#818cf8;">ClearIT Smart Leading</strong>. 
                      Clique no botão abaixo para criar uma nova senha segura:
                    </p>

                    <!-- Botão CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:32px;">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" target="_blank" 
                             style="display:inline-block; background:linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%); color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; padding:16px 44px; border-radius:12px; letter-spacing:0.2px; box-shadow:0 4px 20px rgba(79,70,229,0.35); mso-padding-alt:16px 44px;">
                            Redefinir Minha Senha
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Separador -->
                    <div style="height:1px; background-color:#1e293b; margin:24px 0;"></div>

                    <!-- Aviso de segurança -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0f172a; border-radius:12px; border-left:3px solid #f59e0b;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="color:#fbbf24; font-size:13px; font-weight:600; margin:0 0 6px;">
                            ⚠️ Segurança
                          </p>
                          <p style="color:#94a3b8; font-size:13px; line-height:1.6; margin:0;">
                            Este link expira em <strong style="color:#e2e8f0;">1 hora</strong>. Se você não solicitou essa redefinição, ignore este e-mail — sua senha continuará a mesma.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Link alternativo -->
                    <p style="color:#475569; font-size:12px; line-height:1.6; margin:24px 0 0;">
                      Se o botão não funcionar, copie e cole este link no navegador:<br>
                      <a href="${resetUrl}" style="color:#818cf8; word-break:break-all; font-size:11px; text-decoration:underline;">
                        ${resetUrl}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0; text-align:center;">
              <p style="color:#334155; font-size:12px; margin:0 0 4px; line-height:1.5;">
                © ${new Date().getFullYear()} ClearIT — Smart Leading Platform
              </p>
              <p style="color:#1e293b; font-size:11px; margin:0;">
                Este é um e-mail automático. Por favor, não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Cria e retorna o transporter do Nodemailer.
 */
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * POST /api/auth/reset-password
 * 1. Valida se o e-mail existe
 * 2. Gera o link de reset via Firebase Admin SDK
 * 3. Envia e-mail HTML personalizado via Nodemailer/Gmail SMTP
 */
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'O campo "email" é obrigatório.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verificar se o e-mail existe no Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(normalizedEmail);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        return res.status(404).json({ error: 'E-mail inexistente. Verifique o endereço digitado.' });
      }
      throw err;
    }

    // 2. Verificar se SMTP está configurado
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[Auth] ⚠️ SMTP não configurado. Usando Firebase sendPasswordResetEmail como fallback.');
      // Sinaliza ao frontend para usar o Firebase SDK
      return res.status(200).json({ 
        message: 'E-mail validado.',
        method: 'firebase-sdk'
      });
    }

    // 3. Gerar link de reset via Firebase Admin SDK
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const actionCodeSettings = {
      url: frontendUrl,
      handleCodeInApp: true,
    };

    const resetLink = await auth.generatePasswordResetLink(normalizedEmail, actionCodeSettings);

    // Extrair oobCode e montar URL customizada
    const url = new URL(resetLink);
    const oobCode = url.searchParams.get('oobCode');
    const customResetUrl = `${frontendUrl}?view=reset-password&oobCode=${oobCode}`;

    // 4. Enviar e-mail HTML personalizado
    const mailer = getTransporter();
    const userName = userRecord.displayName || null;

    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || `"ClearIT Smart Leading" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: '🔐 Redefinição de Senha — ClearIT',
      html: buildResetEmailHtml(userName, customResetUrl),
    });

    console.log(`[Auth] ✉️ E-mail de reset enviado para ${normalizedEmail} (ID: ${info.messageId})`);

    return res.status(200).json({ 
      message: 'Link de redefinição enviado para o seu e-mail.',
      method: 'smtp'
    });

  } catch (error) {
    console.error('[Auth] Erro ao processar reset:', error);
    return res.status(500).json({ error: 'Erro ao enviar e-mail. Tente novamente.' });
  }
};
