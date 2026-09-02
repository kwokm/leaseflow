import type { Appearance } from "@clerk/types";

/**
 * Clerk's widgets sit inside a PacketWindow, so they borrow the desk tokens
 * (ink, lilac, line) instead of shipping their own card chrome.
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#1a1a1f",
    colorText: "#1a1a1f",
    colorTextSecondary: "#6b6b76",
    colorBackground: "transparent",
    colorInputBackground: "#ffffff",
    borderRadius: "10px",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    fontSize: "14px",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none border-0",
    card: "bg-transparent shadow-none border-0 p-0 gap-4",
    header: "hidden",
    footer: "bg-transparent",
    footerAction: "bg-transparent",
    socialButtonsBlockButton:
      "border border-line bg-paper text-ink hover:bg-mist transition-colors duration-200",
    formButtonPrimary:
      "bg-ink text-paper hover:bg-ink-2 normal-case text-[14px] font-medium tracking-[-0.14px]",
    formFieldInput: "border border-line bg-paper text-ink",
    dividerLine: "bg-line",
    dividerText: "text-mute text-[12px] font-medium",
  },
};
