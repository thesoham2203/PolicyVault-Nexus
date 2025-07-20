import * as React from 'react';

interface VerificationEmailProps {
  verificationLink: string;
  orgName: string;
}

export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({
  verificationLink,
  orgName,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#1E293B' }}>
    <div style={{ textAlign: 'center', padding: '20px 0', backgroundColor: '#1E3A8A' }}>
      <div style={{ display: 'inline-block', marginBottom: '16px' }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#DBEAFE"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
      </div>
      <h1 style={{ color: '#DBEAFE', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
        PolicyVault Nexus
      </h1>
    </div>

    <div style={{ padding: '30px', backgroundColor: '#FFFFFF' }}>
      <h2 style={{ color: '#1E3A8A', fontSize: '20px', marginBottom: '20px' }}>
        Confirm Your Organization Registration
      </h2>
      <p style={{ marginBottom: '20px', lineHeight: '1.5' }}>
        Dear {orgName},
      </p>
      <p style={{ marginBottom: '30px', lineHeight: '1.5' }}>
        Thank you for registering with PolicyVault Nexus. Please click the button below to verify your email address and complete your organization's registration.
      </p>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <a
          href={verificationLink}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#1E3A8A',
            color: '#FFFFFF',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          Confirm Account
        </a>
      </div>

      <p style={{ marginBottom: '10px', lineHeight: '1.5', fontSize: '14px' }}>
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>

    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#DBEAFE', color: '#1E3A8A', fontSize: '12px' }}>
      <p style={{ margin: '0' }}>
        Empowered by PolicyVault | Supported by Canara Bank
      </p>
    </div>
  </div>
);