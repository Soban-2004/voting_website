import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
  email: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp }: SendOTPRequest = await req.json();
    
    console.log(`Sending OTP ${otp} to ${email}`);

    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            subject: 'Your Voting OTP Code',
          },
        ],
        from: { email: 'royalknights012@gmail.com', name: 'College Voting System' },
        content: [
          {
            type: 'text/html',
            value: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <title>Your Voting OTP</title>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-code { background: #fff; border: 2px solid #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 20px 0; border-radius: 8px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🗳️ College Voting System</h1>
                      <p>Your One-Time Password for Secure Voting</p>
                    </div>
                    <div class="content">
                      <h2>Hello Voter!</h2>
                      <p>You have requested to vote in the college election. Please use the following OTP code to complete your authentication:</p>
                      
                      <div class="otp-code">${otp}</div>
                      
                      <div class="warning">
                        <strong>⚠️ Important Security Information:</strong>
                        <ul>
                          <li>This OTP is valid for 10 minutes only</li>
                          <li>Use this code only on the official voting platform</li>
                          <li>Do not share this code with anyone</li>
                          <li>You can only vote once during the election period</li>
                        </ul>
                      </div>
                      
                      <p>If you did not request this OTP, please ignore this email and contact the election committee immediately.</p>
                      
                      <p><strong>Voting Window:</strong> 2 hours from election start time</p>
                      <p><strong>Support:</strong> contact the election committee if you face any issues</p>
                    </div>
                    <div class="footer">
                      <p>This is an automated message from the College Voting System.<br>
                      Please do not reply to this email.</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          },
        ],
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('SendGrid error:', errorText);
      throw new Error(`SendGrid API error: ${sendGridResponse.status}`);
    }

    console.log('OTP email sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'OTP sent successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);