import { ssnLast4 } from "@/lib/apply/format";
import type { ApplyState, LocalFile } from "@/lib/apply/types";

/**
 * The packet as it is allowed to be stored.
 *
 * Two things are removed before anything is written to Neon or leaves the
 * browser:
 *  - the full SSN, which is reduced to its last four digits. The bureau share
 *    is brokered by Experian Connect, so we never need the number itself.
 *  - local object URLs, which are per-session and meaningless once stored.
 */
export type StoredFile = Omit<LocalFile, "url">;

export type StoredPacket = Omit<ApplyState, "personal" | "payment"> & {
  personal: Omit<ApplyState["personal"], "ssn"> & { ssnLast4: string };
};

function storedFile(file: LocalFile | null): StoredFile | null {
  if (!file) return null;
  const rest: Partial<LocalFile> = { ...file };
  delete rest.url;
  return rest as StoredFile;
}

export function toStoredPacket(state: ApplyState): StoredPacket {
  const { ssn, ...personal } = state.personal;
  const rest: Partial<ApplyState> = { ...state };
  delete rest.payment;

  return {
    ...rest,
    personal: { ...personal, ssnLast4: ssnLast4(ssn) },
    idFront: storedFile(state.idFront),
    idBack: storedFile(state.idBack),
    paystubs: state.paystubs.map((file) => storedFile(file)!) as LocalFile[],
    statements: state.statements.map((file) => storedFile(file)!) as LocalFile[],
  } as StoredPacket;
}
