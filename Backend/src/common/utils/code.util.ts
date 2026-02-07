// ✅ 5 xonali kod generator
export function generate5DigitCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}
