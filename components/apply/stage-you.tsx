"use client";

import { Suspense } from "react";
import { StepBody } from "@/components/apply/motion";
import { StageSection, StepHeading, type StepProps } from "@/components/apply/step-shell";
import { StepBio } from "@/components/apply/step-bio";
import { StepHousehold } from "@/components/apply/step-household";
import { StepStart } from "@/components/apply/step-start";
import { StepYou } from "@/components/apply/step-you";

/** You = listing/start + personal identity + household, composed as one stage. */
export function StageYou(props: StepProps) {
  return (
    <StepBody>
      <StepHeading lead="You." tone="Listing, identity, and household." />
      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        It takes about ten minutes. Your progress saves in this browser, so you can stop and pick it
        back up.
      </p>
      <StageSection label="Listing">
        <StepStart {...props} embedded />
      </StageSection>
      <StageSection label="Identity">
        <StepYou {...props} embedded />
      </StageSection>
      <StageSection label="Household">
        <StepHousehold {...props} embedded />
      </StageSection>
      <StageSection label="Bio">
        <Suspense fallback={null}>
          <StepBio {...props} embedded />
        </Suspense>
      </StageSection>
    </StepBody>
  );
}
