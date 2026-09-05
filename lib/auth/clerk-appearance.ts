import type { Appearance } from "@clerk/types";

/**
 * Clerk's widgets sit inside a PacketWindow. The footer must stay white —
 * a transparent/primary-as-background token paints it near-black and hides
 * "Don't have an account? Sign up".
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#1c1d1f",
    colorText: "#1c1d1f",
    colorTextSecondary: "#6d7988",
    colorTextOnPrimaryBackground: "#ffffff",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorNeutral: "#ffffff",
    borderRadius: "10px",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    fontSize: "14px",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full bg-white shadow-none border-0",
    card: "bg-white shadow-none border-0 p-0 gap-4",
    header: "hidden",
    footer: "bg-white text-ink shadow-none",
    footerAction: "bg-white",
    footerActionText: "text-mute",
    footerActionLink: "text-ink underline",
    footerPages: "bg-white",
    footerPagesLink: "text-mute",
    socialButtonsBlockButton:
      "border border-line bg-paper text-ink hover:bg-mist transition-colors duration-200",
    formButtonPrimary:
      "bg-ink text-paper hover:bg-ink-2 normal-case text-[14px] font-medium tracking-[-0.14px]",
    formFieldInput: "border border-line bg-paper text-ink",
    dividerLine: "bg-line",
    dividerText: "text-mute text-[12px] font-medium",
  },
};
