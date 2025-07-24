// src/types/global.d.ts
interface Window {
  grecaptcha: {
    ready: (callback: () => void) => void;
    execute: (siteKey?: string, options?: { action: string }) => Promise<string>;
    render: (container: string | HTMLElement, parameters: {
      sitekey: string;
      size?: 'invisible' | 'compact' | 'normal';
      theme?: 'light' | 'dark';
    }) => void;
  };
}