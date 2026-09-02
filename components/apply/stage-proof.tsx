"use client";

import { StepBody } from "@/components/apply/motion";
import { StageSection, StepHeading, type StepProps } from "@/components/apply/step-shell";
import { StepBank, StepIncome, StepPhotoId } from "@/components/apply/step-uploads";

/** Proof = Photo ID + Income + Bank, composed as sections. Fields are unchanged. */
export function StageProof(props: StepProps) {
  return (
    <StepBody>
      <StepHeading lead="Proof." tone="Photo ID, income, and bank statements." />
      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        Files stay on your device in this prototype. Images and PDFs both work.
      </p>
      <StageSection label="Photo ID">
        <StepPhotoId {...props} embedded />
      </StageSection>
      <StageSection label="Income">
        <StepIncome {...props} embedded />
      </StageSection>
      <StageSection label="Bank">
        <StepBank {...props} embedded />
      </StageSection>
    </StepBody>
  );
}
