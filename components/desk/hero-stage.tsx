import { HeroPhonePacket } from "@/components/desk/hero-phone-packet";
import { HeroPipeline } from "@/components/desk/hero-pipeline";

/** Layered landing hero: desk pipeline behind, native Jane Doe phone in front. */
export function HeroStage() {
  return (
    <div
      className="hero-compose"
      aria-label="Sample Jane Doe packet over the landlord pipeline"
    >
      <div className="hero-compose-wash">
        <div className="hero-desk-layer">
          <HeroPipeline />
        </div>
        <div className="hero-phone-layer">
          <HeroPhonePacket />
        </div>
      </div>
    </div>
  );
}
