import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { VerificationEmail } from './VerificationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

interface RequestBody {
  email: string;
  organizationName: string;
  verificationLink: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, organizationName, verificationLink } = req.body as RequestBody;

    const { data, error } = await resend.emails.send({
      from: 'PolicyVault Nexus <no-reply@policyvault.com>',
      to: email,
      subject: 'Verify your PolicyVault Nexus account',
      react: VerificationEmail({ verificationLink, organizationName }),
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ message: 'Failed to send verification email' });
  }
}