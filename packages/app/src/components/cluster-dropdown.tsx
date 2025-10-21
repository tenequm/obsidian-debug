"use client";

import {
  type SolanaClusterId,
  useWalletUi,
  useWalletUiCluster,
} from "@wallet-ui/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ClusterDropdown() {
  const { cluster } = useWalletUi();
  const { clusters, setCluster } = useWalletUiCluster();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{cluster.label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup
          onValueChange={(clusterId) =>
            setCluster(clusterId as SolanaClusterId)
          }
          value={cluster.id}
        >
          {clusters.map((clusterItem) => (
            <DropdownMenuRadioItem key={clusterItem.id} value={clusterItem.id}>
              {clusterItem.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
