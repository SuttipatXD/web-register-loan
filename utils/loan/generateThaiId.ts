/** Generates a random 13-digit Thai national-ID number that passes the mod-11 checksum. */
export function generateThaiIdNumber(): string {
  const digits: number[] = [];
  for (let i = 0; i < 12; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }

  const sum = digits.reduce((acc, digit, index) => acc + digit * (13 - index), 0);
  const checkDigit = (11 - (sum % 11)) % 10;

  return [...digits, checkDigit].join('');
}
