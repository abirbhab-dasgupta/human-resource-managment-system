export const BANK_DETAIL_FIELDS = [
    "bankAccountNumber",
    "bankName",
    "ifscCode",
    "panNo",
    "uanNo",
  ] as const;
  
  export type BankDetailField = (typeof BANK_DETAIL_FIELDS)[number];