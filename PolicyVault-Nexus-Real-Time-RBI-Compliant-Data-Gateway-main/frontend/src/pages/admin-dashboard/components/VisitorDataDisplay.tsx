// src/components/VisitorDataDisplay.tsx
import React from 'react';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';

const VisitorDataDisplay: React.FC = () => {
  const { isLoading, error, data, getData } = useVisitorData(
    { extendedResult: true },
    { immediate: true }
  );

  return (
    <div>
      <button onClick={() => getData({ ignoreCache: true })}>
        Reload data
      </button>
      <p>VisitorId: {isLoading ? 'Loading...' : data?.visitorId}</p>
      <p>Full visitor data:</p>
      <pre>{error ? error.message : JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default VisitorDataDisplay;
