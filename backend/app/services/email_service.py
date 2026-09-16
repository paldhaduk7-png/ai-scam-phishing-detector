"""
Email Delivery Service for ScamShield.
Handles transactional password reset 6-digit OTP delivery using standard SMTP with TLS encryption.
"""

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
import smtplib

from app.config import settings

logger = logging.getLogger("scamshield.email_service")


def send_password_reset_otp_email(to_email: str, recipient_name: str, otp_code: str) -> bool:
    """
    Sends a security-branded password reset email containing a 6-digit OTP.
    Uses configured SMTP server with STARTTLS.
    Does NOT log the OTP or credentials.
    """
    if not settings.mail_username or not settings.mail_password:
        logger.warning("SMTP credentials not configured. Skipping OTP email delivery to %s", to_email)
        return False

    greeting_name = recipient_name.strip() if recipient_name else "User"

    # Plaintext fallback content
    text_content = f"""Hello {greeting_name},

We received a request to reset the password for your ScamShield account associated with {to_email}.

Your 6-digit verification code is:
{otp_code}

This code will expire in 10 minutes and can only be used once.

Enter this code on the ScamShield password recovery page to set your new password.

If you did not request this password reset, please disregard this email. Your account remains secure.

Best regards,
The ScamShield Security Team
https://scamshield.ai
"""

    # Modern responsive HTML email template
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ScamShield Verification Code</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      max-width: 540px;
      margin: 32px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
    }}
    .header {{
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      padding: 28px 32px;
      text-align: center;
      color: #ffffff;
    }}
    .header h1 {{
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }}
    .header p {{
      margin: 4px 0 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.85;
      font-weight: 600;
    }}
    .body {{
      padding: 36px 32px;
    }}
    .greeting {{
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }}
    .text {{
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 20px;
    }}
    .otp-container {{
      text-align: center;
      margin: 28px 0;
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 14px;
      padding: 20px;
    }}
    .otp-label {{
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 8px;
    }}
    .otp-code {{
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #1d4ed8;
      margin: 4px 0;
    }}
    .info-box {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #3b82f6;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 12px;
      color: #334155;
      margin: 24px 0;
      line-height: 1.5;
    }}
    .footer {{
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 20px 32px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ScamShield AI</h1>
      <p>Security Operations & Threat Defense</p>
    </div>
    <div class="body">
      <div class="greeting">Hello {greeting_name},</div>
      <p class="text">
        We received a request to reset the password for your ScamShield account (<strong>{to_email}</strong>).
      </p>
      <div class="otp-container">
        <div class="otp-label">Your Verification Code</div>
        <div class="otp-code">{otp_code}</div>
      </div>
      <div class="info-box">
        <strong>Security Notice:</strong> This 6-digit code is single-use and will expire in <strong>10 minutes</strong>.<br>
        Never share this verification code with anyone. If you did not request this password reset, please ignore this email.
      </div>
    </div>
    <div class="footer">
      &copy; ScamShield Platform. Automated Security Notification &bull; Do not reply to this email.
    </div>
  </div>
</body>
</html>
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "ScamShield — Your Password Reset Code"
    msg["From"] = settings.mail_from
    msg["To"] = to_email

    msg.attach(MIMEText(text_content, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        server = smtplib.SMTP(settings.mail_server, settings.mail_port, timeout=15)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.mail_username, settings.mail_password)
        server.sendmail(settings.mail_from, [to_email], msg.as_string())
        server.quit()
        logger.info("Password reset OTP email sent successfully to %s", to_email)
        return True
    except Exception as exc:
        logger.error("Failed to deliver password reset OTP email to %s: %s", to_email, exc)
        return False
