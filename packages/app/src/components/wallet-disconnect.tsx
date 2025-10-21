"use client";

import { useWalletUi } from "@wallet-ui/react";
import type * as React from "react";
import { Button } from "@/components/ui/button";

function WalletDisconnect(props: React.ComponentProps<typeof Button>) {
  const { connected, disconnect } = useWalletUi();
  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      {...props}
      disabled={!connected}
      onClick={disconnect}
    >
      Disconnect
    </Button>
  );
}

export { WalletDisconnect };
