import { creditConsentReady } from "@/lib/legal/fcra";
import { isCompleteDob, isEmail } from "./format";
import { APPLY_STEP, type ApplyState } from "./types";

export type StepErrors = Record<string, string>;

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function isAdult(dateOfBirth: string): boolean {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return dob <= cutoff;
}

function validateYou(state: ApplyState, errors: StepErrors): void {
  const p = state.personal;
  if (!p.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!p.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!p.email.trim()) errors.email = "Enter your email address.";
  else if (!isEmail(p.email)) errors.email = "That email address doesn't look right.";
  if (digits(p.phone).length !== 10) errors.phone = "Enter a 10-digit phone number.";
  if (!isCompleteDob(p.dateOfBirth)) errors.dateOfBirth = "Enter your date of birth as MM/DD/YYYY.";
  else if (!isAdult(p.dateOfBirth)) errors.dateOfBirth = "Applicants must be 18 or older.";
  if (digits(p.ssn).length !== 9) errors.ssn = "Enter 9 digits. Demo values only.";
  if (!p.street.trim()) errors.street = "Enter your street address.";
  if (!p.city.trim()) errors.city = "Enter your city.";
  if (!p.state.trim()) errors.state = "Enter your state.";
  if (digits(p.zip).length !== 5) errors.zip = "Enter a 5-digit ZIP code.";

  state.household.pets.forEach((pet) => {
    if (!pet.type.trim()) errors[`pet-${pet.id}`] = "Enter the type of pet, or remove the row.";
  });
  state.household.occupants.forEach((occupant) => {
    if (!occupant.name.trim()) {
      errors[`occupant-${occupant.id}`] = "Enter a name, or remove the row.";
    }
  });
}

function validateProof(state: ApplyState, errors: StepErrors): void {
  if (!state.idFront) errors.idFront = "Add the front of your photo ID.";
  if (!state.idBack) errors.idBack = "Add the back of your photo ID.";

  if (!state.income.employer.trim()) errors.employer = "Enter your employer or income source.";
  const amount = Number(state.income.monthlyIncome.replace(/[^0-9.]/g, ""));
  if (!amount) errors.monthlyIncome = "Enter your gross monthly income.";
  if (state.paystubs.length < 2) errors.paystubs = "Attach two recent pay stubs.";

  if (!state.bank.bankName.trim()) errors.bankName = "Enter the name of your bank.";
  if (state.statements.length < 1) errors.statements = "Attach at least one bank statement.";
}

/**
 * Credit does not advance until a consent row is written and the Experian stub
 * has been allowed to proceed. Checkboxes + typed name alone are not enough.
 */
function validateCredit(state: ApplyState, errors: StepErrors): void {
  if (!creditConsentReady(state.consent)) {
    if (!state.consent.checkboxAuth) errors.checkboxAuth = "Check the authorization to continue.";
    if (!state.consent.checkboxUse) errors.checkboxUse = "Check the use acknowledgement to continue.";
    if (!state.consent.typedFullName.trim()) {
      errors.typedFullName = "Type your full name to continue.";
    }
    return;
  }

  if (!state.consent.consentId) {
    errors.experian = "Save the authorization before continuing.";
    return;
  }

  if (state.experian.status !== "connected" && state.experian.status !== "authorized") {
    errors.experian = "Continue with Experian to share your report.";
  }
}

/** Per-stage required-field checks. Blocks Next and renders inline messages. */
export function validateStep(step: number, state: ApplyState): StepErrors {
  const errors: StepErrors = {};

  if (step === APPLY_STEP.you) validateYou(state, errors);
  if (step === APPLY_STEP.proof) validateProof(state, errors);
  if (step === APPLY_STEP.credit) validateCredit(state, errors);

  return errors;
}

export function firstErrorKey(errors: StepErrors): string | undefined {
  return Object.keys(errors)[0];
}
