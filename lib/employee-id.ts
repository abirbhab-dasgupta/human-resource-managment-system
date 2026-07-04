export function deriveCompanyCode(companyName: string): string {
    const letters = companyName
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase())
      .join("");
    return (letters || companyName.slice(0, 2).toUpperCase()).slice(0, 3);
  }
  
  export function generateEmployeeCode(
    companyCode: string,
    fullName: string,
    joinYear: number,
    serial: number
  ): string {
    const [first = "", last = first] = fullName.trim().split(/\s+/);
    const namePart = (first.slice(0, 2) + last.slice(0, 2)).toUpperCase().padEnd(4, "X");
    const serialPart = String(serial).padStart(4, "0");
    return `${companyCode}${namePart}${joinYear}${serialPart}`;
  }
  
  export function generateTempPassword(length = 10): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    return Array.from(crypto.getRandomValues(new Uint32Array(length)))
      .map((n) => chars[n % chars.length])
      .join("");
  }