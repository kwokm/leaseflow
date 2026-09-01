"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ApplicationDesk } from "@/components/desk/application-desk";
import { DeskSidebar, type DeskNavLabel } from "@/components/desk/desk-sidebar";
import { PacketWindow } from "@/components/desk/packet-window";
import { PipelineDesk } from "@/components/leasing/pipeline-desk";
import { LeadInbox } from "@/components/leasing/lead-inbox";
import { ShowingsCalendar } from "@/components/leasing/showings-calendar";
import ListingsPage from "@/app/dashboard/listings/page";

const TOUR: { label: DeskNavLabel; title: string }[] = [
  { label: "Pipeline", title: "Pipeline • 510 S Resh St" },
  { label: "Applications", title: "Applications • 510 S Resh St" },
  { label: "Leads", title: "Lead inbox" },
  { label: "Showings", title: "Showings • Tuesday Anaheim" },
  { label: "Properties", title: "Properties" },
];

const DWELL_MS = 3000;

export function HeroDesk() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const reduce = reduceMotion === true;
  const [inView, setInView] = useState(true);
  const [tab, setTab] = useState(0);
  const [touring, setTouring] = useState(true);

  useEffect(() => {
    if (reduce) {
      setTouring(false);
      setTab(0);
    }
  }, [reduce]);

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
    if (!touring || !inView || reduce) return;
    const id = window.setTimeout(() => {
      setTab((current) => (current + 1) % TOUR.length);
    }, DWELL_MS);
    return () => window.clearTimeout(id);
  }, [touring, inView, reduce, tab]);

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

  return (
    <div
      ref={ref}
      className="hero-desk"
      data-tab={active.label}
    >
      <PacketWindow title={active.title} meta="Realtor desk • Demo sync">
        <div className="desk">
          <div className="hero-rail">
            <DeskSidebar
              preview={{
                active: active.label,
                onSelect: selectTab,
              }}
            />
            {!touring && !reduce ? (
              <button type="button" className="hero-replay" onClick={replayTour}>
                Replay tour
              </button>
            ) : null}
          </div>
          <div className="hero-stage min-w-0">
            <div key={active.label} className="hero-panel is-on">
              {active.label === "Pipeline" ? <PipelineDesk /> : null}
              {active.label === "Applications" ? <ApplicationDesk /> : null}
              {active.label === "Leads" ? <LeadInbox /> : null}
              {active.label === "Showings" ? <ShowingsCalendar /> : null}
              {active.label === "Properties" ? <ListingsPage /> : null}
            </div>
          </div>
        </div>
      </PacketWindow>
    </div>
  );
}
