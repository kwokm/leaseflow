import { isCompleteDob, isEmail } from "./format";
import type { ApplyState } from "./types";

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

/** Per-step required-field checks. Blocks Next and renders inline messages. */
export function validateStep(step: number, state: ApplyState): StepErrors {
  const errors: StepErrors = {};

  if (step === 2) {
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
  }

  if (step === 3) {
    if (!state.idFront) errors.idFront = "Add the front of your photo ID.";
    if (!state.idBack) errors.idBack = "Add the back of your photo ID.";
  }

  if (step === 4) {
    if (!state.income.employer.trim()) errors.employer = "Enter your employer or income source.";
    const amount = Number(state.income.monthlyIncome.replace(/[^0-9.]/g, ""));
    if (!amount) errors.monthlyIncome = "Enter your gross monthly income.";
    if (state.paystubs.length < 2) errors.paystubs = "Attach two recent pay stubs.";
  }

  if (step === 5) {
    if (!state.bank.bankName.trim()) errors.bankName = "Enter the name of your bank.";
    if (state.statements.length < 1) errors.statements = "Attach at least one bank statement.";
  }

  if (step === 6) {
    if (state.experian.status !== "connected") {
      errors.experian = "Connect the demo credit report to continue.";
    }
  }

  if (step === 7) {
    state.household.pets.forEach((pet) => {
      if (!pet.type.trim()) errors[`pet-${pet.id}`] = "Enter the type of pet, or remove the row.";
    });
    state.household.occupants.forEach((occupant) => {
      if (!occupant.name.trim()) {
        errors[`occupant-${occupant.id}`] = "Enter a name, or remove the row.";
      }
    });
  }

  if (step === 8) {
    if (!state.consent.fcra) errors.fcra = "You must authorize the screening to continue.";
    if (!state.consent.backgroundAck) errors.backgroundAck = "Acknowledge the background notice.";
    if (!state.consent.signature.trim()) errors.signature = "Type your full name to sign.";
    if (digits(state.payment.cardNumber).length !== 16) {
      errors.cardNumber = "Enter a 16-digit demo card number.";
    }
    if (!state.payment.cardName.trim()) errors.cardName = "Enter the name on the card.";
    if (digits(state.payment.expiry).length !== 4) errors.expiry = "Enter an expiry as MM/YY.";
    if (digits(state.payment.cvc).length < 3) errors.cvc = "Enter the 3-digit security code.";
    if (digits(state.payment.billingZip).length !== 5) errors.billingZip = "Enter a 5-digit ZIP.";
  }

  return errors;
}

export function firstErrorKey(errors: StepErrors): string | undefined {
  return Object.keys(errors)[0];
}
