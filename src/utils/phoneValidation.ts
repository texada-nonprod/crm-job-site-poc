// Shared phone/zip masking and validation helpers

export const applyPhoneMask = (value: string, country: string): string => {
  const digits = value.replace(/\D/g, '');
  if (country === 'US' || country === 'CA') {
    const d = digits.slice(0, 10);
    if (d.length <= 3) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  if (country === 'AU') {
    const d = digits.slice(0, 10);
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return value;
};

export const applyZipMask = (value: string, country: string): string => {
  if (country === 'US') {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  if (country === 'CA') {
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    if (clean.length <= 3) return clean;
    return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  }
  if (country === 'AU') {
    return value.replace(/\D/g, '').slice(0, 4);
  }
  return value;
};

export const validateZip = (value: string, country: string): boolean => {
  if (!value.trim()) return false;
  if (country === 'US') return /^\d{5}(-\d{4})?$/.test(value);
  if (country === 'CA') return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(value.toUpperCase());
  if (country === 'AU') return /^\d{4}$/.test(value);
  return value.trim().length > 0;
};

export const validatePhone = (value: string, country: string): boolean => {
  const digits = value.replace(/\D/g, '');
  if (country === 'US' || country === 'CA') return digits.length === 10;
  if (country === 'AU') return digits.length === 10;
  return digits.length >= 7;
};

export const validateEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
