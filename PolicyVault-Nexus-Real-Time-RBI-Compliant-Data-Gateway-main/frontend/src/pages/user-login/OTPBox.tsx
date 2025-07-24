// import React, { useEffect, useState } from 'react';

// interface OTPBoxProps {
//   onSubmit: (otp: string) => void;
//   onResend: () => void;
//   allowResend: boolean;
//   resendUsed: boolean;
// }

// const OTPBox: React.FC<OTPBoxProps> = ({ onSubmit, onResend, allowResend, resendUsed }) => {
//   const [otp, setOtp] = useState('');
//   const [timer, setTimer] = useState(30);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimer(prev => (prev > 0 ? prev - 1 : 0));
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleSubmit = () => {
//     if (otp.length === 6) {
//       onSubmit(otp);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center space-y-4 w-full">
//       <input
//         type="text"
//         value={otp}
//         onChange={(e) => setOtp(e.target.value)}
//         maxLength={6}
//         placeholder="Enter OTP"
//         className="w-full text-center text-lg p-3 border rounded-md shadow focus:outline-none"
//       />

//       <button
//         onClick={handleSubmit}
//         className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
//       >
//         Verify OTP
//       </button>

//       {timer > 0 ? (
//         <p className="text-sm text-gray-500">Resend available in {timer}s</p>
//       ) : allowResend && !resendUsed ? (
//         <button onClick={onResend} className="text-blue-600 underline">
//           Resend OTP
//         </button>
//       ) : (
//         <p className="text-sm text-red-500">Resend limit reached</p>
//       )}
//     </div>
//   );
// };

// export default OTPBox;

// OTPBox.tsx (Updated with 6 input boxes)
import React, { useEffect, useRef, useState } from 'react';

interface OTPBoxProps {
  onSubmit: (otp: string) => void;
  onResend: () => void;
  allowResend: boolean;
  resendUsed: boolean;
}

const OTPBox: React.FC<OTPBoxProps> = ({ onSubmit, onResend, allowResend, resendUsed }) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow numeric
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    paste.forEach((char, i) => {
      if (/^[0-9]$/.test(char)) newOtp[i] = char;
    });
    setOtp(newOtp);
    const filledLength = paste.length;
    if (filledLength < 6) {
      inputsRef.current[filledLength]?.focus();
    }
  };

  const handleSubmit = () => {
    const finalOtp = otp.join('');
    if (finalOtp.length === 6) {
      onSubmit(finalOtp);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            value={digit}
            maxLength={1}
            ref={(el) => (inputsRef.current[index] = el)}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-10 h-12 text-center text-lg border rounded-md shadow focus:outline-none"
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-[#1E3A8A] text-[#DBEAFE] text-white px-5 py-2 rounded hover:bg-[#1E40AF]"
      >
        Verify OTP
      </button>

      {timer > 0 ? (
        <p className="text-sm text-gray-500">Resend available in {timer}s</p>
      ) : allowResend && !resendUsed ? (
        <button onClick={onResend} className="bg-[#DBEAFE] text-[#1E3A8A] underline">
          Resend OTP
        </button>
      ) : (
        <p className="text-sm text-red-500">Resend limit reached</p>
      )}
    </div>
  );
};

export default OTPBox;
