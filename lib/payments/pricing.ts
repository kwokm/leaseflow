import { STANDARD_SCREENING_FEE } from "@/lib/data/mock-data";

/**
 * One price, paid by the applicant. There is no landlord surcharge and no
 * second tier — v1 is the Standard screening packet only.
 */
export const STANDARD_SCREENING_FEE_CENTS = Math.round(STANDARD_SCREENING_FEE * 100);

export const STANDARD_SCREENING_LABEL = "Leaseproof Standard screening";

export const STANDARD_SCREENING_DESCRIPTION =
  "Application packet, ID and income review, and credit-share authorization. Not a collected landlord screening fee.";
