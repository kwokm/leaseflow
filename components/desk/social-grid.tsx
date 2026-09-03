import { cn } from "@/lib/utils";

export function networkLabel(network: string): string {
  if (network === "tiktok") return "TikTok";
  if (network === "facebook") return "Facebook";
  return "Instagram";
}

export function SocialGrid({
  posts,
  label,
  compact = false,
}: {
  posts: { permalink: string; thumbUrl?: string; caption: string; position: number }[];
  label: string;
  compact?: boolean;
}) {
  if (!posts.length) return null;
  return (
    <div className={cn(compact ? "mt-2" : "mt-3")}>
      {label ? (
        <p className="mb-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
          {label}
        </p>
      ) : null}
      <ol className={cn("bio-grid", compact && "max-w-[160px]")}>
        {posts.map((post) => (
          <li key={post.permalink} className="bio-tile">
            <a
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="block h-full w-full"
            >
              {post.thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.thumbUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="p-1 text-[10px] font-medium text-mute">
                  {post.caption || `Post ${post.position}`}
                </span>
              )}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
