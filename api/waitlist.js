const SUPABASE_URL = 'https://fohrghlhfwzqgltwnojg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaHJnaGxoZnd6cWdsdHdub2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NjM4MTAsImV4cCI6MjA5MDEzOTgxMH0.mRXwO2PFPROUgG2EnJWkWpWaJYacODcjpV29x5dkkbE';
const RESEND_KEY = 're_bnMnkW9W_CbbFPaewoq1u5CYhFeYHgSQM';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, zip } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ email, zip: zip || null })
  });

  if (!dbRes.ok && dbRes.status !== 409) {
    return res.status(500).json({ error: 'Failed to save' });
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_KEY}`
    },
    body: JSON.stringify({
      from: 'CarSnipe <onboarding@resend.dev>',
      to: 'nicolaskowalski296@gmail.com',
      subject: `New CarSnipe signup: ${email}`,
      html: `<p><strong>New waitlist signup</strong></p><p>Email: ${email}</p><p>ZIP: ${zip || 'not provided'}</p>`
    })
  });

  return res.status(200).json({ success: true });
}