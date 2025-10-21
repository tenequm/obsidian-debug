import { type GetExplorerLinkArgs, getExplorerLink } from "gill";
import { ArrowUpRightFromSquare } from "lucide-react";
import { useSolana } from "@/components/solana/use-solana";

export function AppExplorerLink({
  className,
  label = "",
  ...link
}: GetExplorerLinkArgs & {
  className?: string;
  label: string;
}) {
  const { cluster } = useSolana();
  return (
    <a
      className={className ? className : "link inline-flex gap-1 font-mono"}
      href={getExplorerLink({ ...link, cluster: cluster.cluster })}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
      <ArrowUpRightFromSquare size={12} />
    </a>
  );
}
