"use client";

import { Field, MaskedField } from "@/components/apply/field";
import { FieldGrid, Note, Panel, StepChrome } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import { formatDob, formatPhone, formatSsn, maskDob, maskSsn } from "@/lib/apply/format";
import type { PersonalInfo } from "@/lib/apply/types";

export function StepYou({ state, patch, errors, embedded }: StepProps) {
  const p = state.personal;
  const set = (partial: Partial<PersonalInfo>) => patch({ personal: { ...p, ...partial } });

  return (
    <StepChrome embedded={embedded} lead="About you." tone="Sensitive fields stay masked.">
      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        Nothing reaches the landlord until you submit. Until then your draft stays in this browser.
      </p>

      <Panel title="Your name and contact">
        <div className="space-y-4">
          <FieldGrid>
            <Field
              id="firstName"
              label="First name"
              autoComplete="given-name"
              value={p.firstName}
              error={errors.firstName}
              onChange={(event) => set({ firstName: event.target.value })}
            />
            <Field
              id="lastName"
              label="Last name"
              autoComplete="family-name"
              value={p.lastName}
              error={errors.lastName}
              onChange={(event) => set({ lastName: event.target.value })}
            />
          </FieldGrid>
          <FieldGrid>
            <Field
              id="email"
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={p.email}
              error={errors.email}
              onChange={(event) => set({ email: event.target.value })}
            />
            <Field
              id="phone"
              label="Phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              value={p.phone}
              error={errors.phone}
              onChange={(event) => set({ phone: formatPhone(event.target.value) })}
            />
          </FieldGrid>
        </div>
      </Panel>

      <Panel title="Identity" description="Used to match your credit file.">
        <FieldGrid>
          <MaskedField
            id="dateOfBirth"
            label="Date of birth"
            inputMode="numeric"
            autoComplete="off"
            placeholder="MM/DD/YYYY"
            maskedValue={maskDob(p.dateOfBirth)}
            value={p.dateOfBirth}
            error={errors.dateOfBirth}
            hint="You must be 18 or older to apply."
            onChange={(event) => set({ dateOfBirth: formatDob(event.target.value) })}
          />
          <MaskedField
            id="ssn"
            label="Social security number"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000-00-0000"
            maskedValue={maskSsn(p.ssn)}
            value={p.ssn}
            error={errors.ssn}
            hint="Demo only — any 9 digits will do."
            onChange={(event) => set({ ssn: formatSsn(event.target.value) })}
          />
        </FieldGrid>
      </Panel>

      <Panel title="Current address">
        <div className="space-y-4">
          <FieldGrid>
            <Field
              id="street"
              label="Street address"
              autoComplete="address-line1"
              value={p.street}
              error={errors.street}
              onChange={(event) => set({ street: event.target.value })}
            />
            <Field
              id="unit"
              label="Apartment or unit"
              autoComplete="address-line2"
              placeholder="Optional"
              value={p.unit}
              onChange={(event) => set({ unit: event.target.value })}
            />
          </FieldGrid>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Field
              id="city"
              label="City"
              autoComplete="address-level2"
              containerClassName="sm:col-span-2"
              value={p.city}
              error={errors.city}
              onChange={(event) => set({ city: event.target.value })}
            />
            <Field
              id="state"
              label="State"
              autoComplete="address-level1"
              maxLength={2}
              placeholder="IL"
              value={p.state}
              error={errors.state}
              onChange={(event) => set({ state: event.target.value.toUpperCase() })}
            />
            <Field
              id="zip"
              label="ZIP code"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              value={p.zip}
              error={errors.zip}
              onChange={(event) => set({ zip: event.target.value.replace(/\D/g, "").slice(0, 5) })}
            />
          </div>
        </div>
      </Panel>

      <Note>
        Nothing here is transmitted anywhere. Clearing your browser storage removes it for good.
      </Note>
    </StepChrome>
  );
}
