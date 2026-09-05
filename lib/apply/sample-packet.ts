/** Seeded Jane Doe file used on marketing illustrations. Not a real applicant. */
export const DEMO_APPLICANT_ID = "app-jane";

const SAMPLE_PACKET_IDS = new Set(["jane-doe", "jane", "app-jane", "resh-510"]);

/** Public marketing aliases that resolve to the Jane Doe sample packet. */
export function isSampleMarketingPacket(id: string): boolean {
  return SAMPLE_PACKET_IDS.has(id);
}

/**
 * Map a public packet id onto the seeded Jane Doe applicant, or return the
 * id unchanged so unknown paths 404 instead of impersonating Jane.
 */
export function packetApplicantId(id: string): string {
  return isSampleMarketingPacket(id) ? DEMO_APPLICANT_ID : id;
}
