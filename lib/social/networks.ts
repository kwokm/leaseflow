import { SOCIAL_NETWORKS, type SocialNetwork } from "../apply/types.ts";

export function isSocialNetwork(value: string): value is SocialNetwork {
  return (SOCIAL_NETWORKS as readonly string[]).includes(value);
}
