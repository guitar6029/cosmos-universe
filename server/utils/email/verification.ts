type VerificationEmailOptions = {
  otpCode: string;
};

export function renderVerificationEmail({ otpCode }: VerificationEmailOptions): string {
  // OTP codes must be numeric and six digits long.
  if (!/^\d{6}$/.test(otpCode)) {
    throw new Error("Invalid verification code");
  }

  const year = new Date().getUTCFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cosmos Universe Access Code</title>
</head>

<body style="margin:0;padding:0;background-color:#102834;font-family:Arial,Helvetica,sans-serif;">

  <div style="display:none;font-size:1px;color:#102834;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Your Cosmos Universe verification code is ready.
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0"
    width="100%" style="background-color:#102834;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0"
          border="0" width="100%"
          style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:24px 16px 30px;">
              <div style="font-size:26px;font-weight:bold;color:#F7E9C9;letter-spacing:1px;">
                COSMOS UNIVERSE
              </div>
              <div style="font-size:11px;color:#9EC8C5;letter-spacing:3px;padding-top:12px;">
                THE COSMIC ACCESS NETWORK
              </div>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color:#F8F0DF;border-radius:12px 12px 0 0;padding:36px 24px;text-align:center;">

              <div style="font-size:12px;font-weight:bold;color:#C24E3C;letter-spacing:1px;">
                &#9733; INCOMING TRANSMISSION &#9733;
              </div>

              <h1 style="font-size:28px;line-height:36px;color:#12313D;margin:16px 0 20px;">
                Your Cosmic Access Code
              </h1>

              <p style="font-size:15px;line-height:24px;color:#536B70;margin:0;">
                Greetings, space traveler!<br>
                Use the verification code below to complete
                your sign-in to Cosmos Universe.
              </p>

              <!-- Verification code -->
              <table role="presentation" cellpadding="0" cellspacing="0"
                border="0" align="center"
                style="margin:32px auto 16px;">
                <tr>
                  <td align="center"
                    style="background-color:#FFF8EA;border:2px solid #C24E3C;border-radius:10px;padding:18px 28px;">
                    <span style="font-size:38px;font-weight:bold;letter-spacing:5px;color:#12313D;font-family:Arial,Helvetica,sans-serif;">
                      ${otpCode}
                    </span>
                  </td>
                </tr>
              </table>

              <div style="font-size:11px;font-weight:bold;letter-spacing:2px;color:#C24E3C;">
                YOUR PERSONAL ACCESS CODE
              </div>

              <div style="height:1px;background-color:#D8C9AD;margin:28px 0 22px;"></div>

              <p style="font-size:13px;line-height:21px;color:#536B70;margin:0;">
                Keep this code confidential.<br>
                Mission Control will never ask you to share it.
              </p>

            </td>
          </tr>

          <!-- Security section -->
          <tr>
            <td style="background-color:#EFE5D2;padding:28px 24px;border-radius:0 0 12px 12px;">

              <h2 style="font-size:17px;line-height:24px;color:#12313D;margin:0 0 12px;">
                Didn't request this transmission?
              </h2>

              <p style="font-size:13px;line-height:21px;color:#536B70;margin:0;">
                If you didn't request this verification code,
                you can safely ignore this message.
                No further action is required.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:30px 16px;">

              <div style="font-size:15px;font-weight:bold;color:#F7E9C9;">
                COSMOS UNIVERSE
              </div>

              <p style="font-size:12px;line-height:20px;color:#9EC8C5;margin:12px 0 20px;">
                Exploring tomorrow, one transmission at a time.
              </p>

              <div style="border-top:1px solid #43636B;padding-top:18px;font-size:12px;color:#9EC8C5;">
                &copy; ${year} Cosmos Universe
              </div>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
