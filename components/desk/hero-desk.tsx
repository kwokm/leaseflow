'use client';

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useReducedMotion } from "motion/react";
import { ApplicationDesk } from "@/components/desk/application-desk";
import { DeskSidebar, type DeskNavLabel } from "@/components/desk/desk-sidebar";
import { PacketWindow } from "@/components/desk/packet-window";
import { ListingThumb } from "@/components/listings/photos";
import { PipelineDesk } from "@/components/leasing/pipeline-desk";
import { getApplicantsByProperty, mockProperties } from "@/lib/data/mock-data";
import { shortAddress } from "@/lib/desk/display";
import { cn } from "@/lib/utils";

const TOUR: { label: DeskNavLabel; title: string }[] = [
  { label: "Pipeline", title: "Pipeline • 170 Chorus" },
  { label: "Applications", title: "Applications • 170 Chorus" },
  { label: "Properties", title: "Properties" },
];

const DWELL_MS = 3000;

function PropertiesPreview() {
  return (
    <div className="overflow-x-auto">
      <table className="app-table">
        <thead>
          <tr>
            <th>Property</th>
            <th className="num">Rent</th>
            <th className="num">Applicants</th>
            <th>Package</th>
          </tr>
        </thead>
        <tbody>
          {mockProperties.map((property) => (
            <tr key={property.id}>
              <td>
                <span className="flex items-center gap-3">
                  <ListingThumb src={property.photos?.[0]} alt="" />
                  <span>{shortAddress(property.address)}</span>
                </span>
              </td>
              <td className="num">${property.rent.toLocaleString()}</td>
              <td className="num">{getApplicantsByProperty(property.id).length}</td>
              <td>Standard</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Screening-only desk crop. Auto-tours unless `quiet` (Platform section). No dashboard links. */
export function HeroDesk({ quiet = false }: { quiet?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const reduce = reduceMotion === true;
  const [inView, setInView] = useState(true);
  const [tab, setTab] = useState(0);
  const [touring, setTouring] = useState(!quiet);

  useEffect(() => {
    if (reduce || quiet) {
      setTouring(false);
      setTab(0);
    }
  }, [reduce, quiet]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!touring || !inView || reduce || quiet) return;
    const id = window.setTimeout(() => {
      setTab((current) => (current + 1) % TOUR.length);
    }, DWELL_MS);
    return () => window.clearTimeout(id);
  }, [touring, inView, reduce, quiet, tab]);

  const active = TOUR[tab] ?? TOUR[0];

  function selectTab(label: DeskNavLabel) {
    const index = TOUR.findIndex((item) => item.label === label);
    if (index < 0) return;
    setTouring(false);
    setTab(index);
  }

  function replayTour() {
    setTab(0);
    setTouring(true);
  }

  function keepPreviewInPlace(event: MouseEvent<HTMLDivElement>) {
    const link = (event.target as Element).closest("a");
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      ref={ref}
      className={cn("hero-desk", quiet && "is-quiet")}
      data-tab={active.label}
      onClickCapture={keepPreviewInPlace}
    >
      <PacketWindow title={active.title} meta="Landlord desk" stamp="SAMPLE">
        <div className="desk">
          <div className="hero-rail">
            <DeskSidebar
              preview={{
                active: active.label,
                onSelect: selectTab,
              }}
            />
            {!quiet && !touring && !reduce ? (
              <button type="button" className="hero-replay" onClick={replayTour}>
                Replay tour
              </button>
            ) : null}
          </div>
          <div className="hero-stage min-w-0">
            <div key={active.label} className="hero-panel is-on">
              {active.label === "Pipeline" ? <PipelineDesk preview /> : null}
              {active.label === "Applications" ? <ApplicationDesk preview /> : null}
              {active.label === "Properties" ? <PropertiesPreview /> : null}
            </div>
          </div>
        </div>
      </PacketWindow>
    </div>
  );
}
