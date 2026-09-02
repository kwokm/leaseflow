"use client";

import { Plus, Scale, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FieldError } from "@/components/apply/field";
import { Note, Panel, StepChrome } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import type { HouseholdInfo, OccupantEntry, PetEntry } from "@/lib/apply/types";

function rowId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

export function StepHousehold({ state, patch, errors, embedded }: StepProps) {
  const household = state.household;
  const set = (partial: Partial<HouseholdInfo>) =>
    patch({ household: { ...household, ...partial } });

  const updatePet = (id: string, partial: Partial<PetEntry>) =>
    set({ pets: household.pets.map((pet) => (pet.id === id ? { ...pet, ...partial } : pet)) });

  const updateOccupant = (id: string, partial: Partial<OccupantEntry>) =>
    set({
      occupants: household.occupants.map((entry) =>
        entry.id === id ? { ...entry, ...partial } : entry
      ),
    });

  return (
    <StepChrome embedded={embedded} lead="Household." tone="Optional, but it speeds up review.">
      <Panel title="Pets" description="List anything that will live at the property.">
        <div className="space-y-4">
          {household.pets.length === 0 && (
            <p className="text-[14px] font-medium text-mute">No pets added.</p>
          )}

          {household.pets.map((pet, index) => (
            <div key={pet.id} className="rounded-btn border border-line p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-mute">Pet {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="iconTouch"
                  aria-label={`Remove pet ${index + 1}`}
                  className="text-mute hover:text-no"
                  onClick={() => set({ pets: household.pets.filter((p) => p.id !== pet.id) })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field
                  id={`pet-type-${pet.id}`}
                  label="Type"
                  placeholder="Dog"
                  value={pet.type}
                  error={errors[`pet-${pet.id}`]}
                  onChange={(event) => updatePet(pet.id, { type: event.target.value })}
                />
                <Field
                  id={`pet-breed-${pet.id}`}
                  label="Breed"
                  placeholder="Beagle"
                  value={pet.breed}
                  onChange={(event) => updatePet(pet.id, { breed: event.target.value })}
                />
                <Field
                  id={`pet-weight-${pet.id}`}
                  label="Weight"
                  placeholder="24 lbs"
                  value={pet.weight}
                  onChange={(event) => updatePet(pet.id, { weight: event.target.value })}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="touch"
            onClick={() =>
              set({
                pets: [...household.pets, { id: rowId("pet"), type: "", breed: "", weight: "" }],
              })
            }
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add a pet
          </Button>
        </div>
      </Panel>

      <Panel title="Other occupants" description="Anyone else moving in, including children.">
        <div className="space-y-4">
          {household.occupants.length === 0 && (
            <p className="text-[14px] font-medium text-mute">No other occupants added.</p>
          )}

          {household.occupants.map((occupant, index) => (
            <div key={occupant.id} className="rounded-btn border border-line p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-mute">Occupant {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="iconTouch"
                  aria-label={`Remove occupant ${index + 1}`}
                  className="text-mute hover:text-no"
                  onClick={() =>
                    set({
                      occupants: household.occupants.filter((entry) => entry.id !== occupant.id),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field
                  id={`occupant-name-${occupant.id}`}
                  label="Full name"
                  value={occupant.name}
                  error={errors[`occupant-${occupant.id}`]}
                  onChange={(event) => updateOccupant(occupant.id, { name: event.target.value })}
                />
                <Field
                  id={`occupant-rel-${occupant.id}`}
                  label="Relationship"
                  placeholder="Spouse"
                  value={occupant.relationship}
                  onChange={(event) =>
                    updateOccupant(occupant.id, { relationship: event.target.value })
                  }
                />
                <Field
                  id={`occupant-age-${occupant.id}`}
                  label="Age"
                  inputMode="numeric"
                  maxLength={3}
                  value={occupant.age}
                  onChange={(event) =>
                    updateOccupant(occupant.id, {
                      age: event.target.value.replace(/\D/g, "").slice(0, 3),
                    })
                  }
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="touch"
            onClick={() =>
              set({
                occupants: [
                  ...household.occupants,
                  { id: rowId("occ"), name: "", relationship: "", age: "" },
                ],
              })
            }
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add an occupant
          </Button>
        </div>
      </Panel>

      <Panel title="Disclosures">
        <div className="space-y-1">
          <Checkbox
            id="smoker"
            checked={household.smoker}
            onChange={(checked) => set({ smoker: checked })}
          >
            Someone in the household smokes
          </Checkbox>
          <Checkbox
            id="priorEviction"
            checked={household.priorEviction}
            onChange={(checked) => set({ priorEviction: checked })}
          >
            I have had an eviction filed against me
          </Checkbox>
          <div className="pt-2">
            <label
              htmlFor="household-notes"
              className="mb-1.5 block text-[13px] font-medium tracking-[-0.13px] text-ink-2"
            >
              Anything you&apos;d like to explain
            </label>
            <textarea
              id="household-notes"
              rows={3}
              value={household.notes}
              onChange={(event) => set({ notes: event.target.value })}
              placeholder="Optional — context for the landlord"
              className="w-full rounded-btn border border-line-2 bg-paper p-3 text-[15px] font-medium tracking-[-0.16px] text-ink placeholder:text-mute-2 transition-[border-color,background-color] duration-240 ease-premium hover:border-mute-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            />
            <FieldError id="household-notes-error" message={errors.notes} />
          </div>
        </div>
      </Panel>

      <Panel title="Background check">
        <div className="flex items-start gap-3">
          <Scale className="mt-0.5 h-5 w-5 shrink-0 text-mute" aria-hidden />
          <p className="text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink-2">
            A public-records search runs after you submit and covers criminal, eviction, and
            registry sources. In this prototype it is a mock note only — no records are searched and
            no data is retrieved.
          </p>
        </div>
      </Panel>

      <Note>You can skip everything on this step and still submit your application.</Note>
    </StepChrome>
  );
}
