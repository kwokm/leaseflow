"use client";

import { Field } from "@/components/apply/field";
import { FileSlot, FileStack } from "@/components/apply/file-upload";
import { FieldGrid, Note, Panel, StepHeading } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import type { BankInfo, IncomeInfo } from "@/lib/apply/types";

export function StepPhotoId({ state, patch, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <StepHeading lead="Photo ID." tone="Front and back, please." />
      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        A driver&apos;s licence, state ID, or passport works. Images and PDFs are both fine. Files
        stay on your device in this prototype.
      </p>

      <Panel>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FileSlot
            id="id-front"
            label="Front of ID"
            file={state.idFront}
            error={errors.idFront}
            onChange={(file) => patch({ idFront: file })}
          />
          <FileSlot
            id="id-back"
            label="Back of ID"
            file={state.idBack}
            error={errors.idBack}
            onChange={(file) => patch({ idBack: file })}
          />
        </div>
      </Panel>

      <Note>
        Make sure all four corners are visible and the text is readable. Blurry IDs are the most
        common reason an application gets sent back.
      </Note>
    </div>
  );
}

export function StepIncome({ state, patch, errors }: StepProps) {
  const income = state.income;
  const set = (partial: Partial<IncomeInfo>) => patch({ income: { ...income, ...partial } });

  return (
    <div className="space-y-5">
      <StepHeading lead="Income." tone="Plus your two most recent pay stubs." />

      <Panel title="Where your income comes from">
        <div className="space-y-4">
          <FieldGrid>
            <Field
              id="employer"
              label="Employer or income source"
              autoComplete="organization"
              value={income.employer}
              error={errors.employer}
              onChange={(event) => set({ employer: event.target.value })}
            />
            <Field
              id="position"
              label="Job title"
              autoComplete="organization-title"
              placeholder="Optional"
              value={income.position}
              onChange={(event) => set({ position: event.target.value })}
            />
          </FieldGrid>
          <FieldGrid>
            <Field
              id="monthlyIncome"
              label="Gross monthly income"
              inputMode="numeric"
              placeholder="$0"
              value={income.monthlyIncome}
              error={errors.monthlyIncome}
              hint="Before taxes and deductions."
              onChange={(event) =>
                set({
                  monthlyIncome: event.target.value.replace(/[^0-9.]/g, "").slice(0, 9),
                })
              }
            />
            <Field
              id="incomeStart"
              label="Started on"
              placeholder="Optional — e.g. 2023-05"
              value={income.startDate}
              onChange={(event) => set({ startDate: event.target.value })}
            />
          </FieldGrid>
          <Field
            id="otherIncome"
            label="Other income"
            placeholder="Optional — benefits, support, side work"
            value={income.otherIncome}
            onChange={(event) => set({ otherIncome: event.target.value })}
          />
        </div>
      </Panel>

      <Panel title="Pay stubs" description="Your two most recent stubs, as images or PDFs.">
        <FileStack
          id="paystubs"
          label="Pay stubs"
          max={2}
          files={state.paystubs}
          error={errors.paystubs}
          onChange={(files) => patch({ paystubs: files })}
        />
      </Panel>
    </div>
  );
}

export function StepBank({ state, patch, errors }: StepProps) {
  const bank = state.bank;
  const set = (partial: Partial<BankInfo>) => patch({ bank: { ...bank, ...partial } });

  return (
    <div className="space-y-5">
      <StepHeading lead="Bank statements." tone="One to three, most recent first." />
      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        Statements corroborate the income you just entered. You can black out transaction lines — we
        only need the deposits.
      </p>

      <Panel title="Your bank">
        <FieldGrid>
          <Field
            id="bankName"
            label="Bank name"
            value={bank.bankName}
            error={errors.bankName}
            onChange={(event) => set({ bankName: event.target.value })}
          />
          <Field
            id="accountLast4"
            label="Last 4 of account"
            inputMode="numeric"
            maxLength={4}
            placeholder="Optional"
            value={bank.accountLast4}
            onChange={(event) =>
              set({ accountLast4: event.target.value.replace(/\D/g, "").slice(0, 4) })
            }
          />
        </FieldGrid>
      </Panel>

      <Panel title="Statements" description="Up to three files. Images and PDFs both work.">
        <FileStack
          id="statements"
          label="Bank statements"
          max={3}
          files={state.statements}
          error={errors.statements}
          onChange={(files) => patch({ statements: files })}
        />
      </Panel>

      <Note>Never share full account or routing numbers in a rental application.</Note>
    </div>
  );
}
