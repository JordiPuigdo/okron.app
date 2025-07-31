export const SIGNATURE_TYPES = {
  WORKER: "WORKER",
  CLIENT: "CLIENT",
  UNDEFINED: "UNDEFINED",
} as const;

export type SignatureType = keyof typeof SIGNATURE_TYPES;
