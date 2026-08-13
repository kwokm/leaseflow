"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion/reduced";

const SELECTOR = "[data-reveal]";

function showAll(root: ParentNode) {
  root.querySelectorAll(SELECTOR).forEach((node) => {
    node.classList.add("is-visible");
  });
}

/**
 * One observer for the whole tree. Toggles `.is-visible` so scroll-back
 * reverses the entrance. Skipped entirely when motion is reduced.
 */
export function RevealRoot() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      showAll(document);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        }
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0 }
    );

    const seen = new WeakSet<Element>();

    const watch = (root: ParentNode) => {
      root.querySelectorAll(SELECTOR).forEach((node) => {
        if (seen.has(node)) return;
        seen.add(node);
        observer.observe(node);
      });
    };

    watch(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR) && !seen.has(node)) {
            seen.add(node);
            observer.observe(node);
          }
          watch(node);
        });
      }
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
