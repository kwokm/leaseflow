import { HeroPacket } from "@/components/desk/hero-packet";
import { HeroPipeline } from "@/components/desk/hero-pipeline";

/** Layered landing hero: desk pipeline behind, Jane Doe packet in front. */
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
          <div className="hero-phone">
            <div className="hero-phone-screen">
              <HeroPacket />
            </div>
            <span className="hero-phone-bar" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
