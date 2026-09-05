import { SOCIAL_NETWORKS, type SocialNetwork } from "./snapshot";

export function isSocialNetwork(value: string): value is SocialNetwork {
  return (SOCIAL_NETWORKS as readonly string[]).includes(value);
}
