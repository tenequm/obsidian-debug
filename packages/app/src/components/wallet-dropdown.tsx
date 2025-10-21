"use client";

import {
  ellipsify,
  type UiWallet,
  useWalletUi,
  useWalletUiWallet,
} from "@wallet-ui/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function WalletAvatar({
  className,
  wallet,
}: {
  className?: string;
  wallet: UiWallet;
}) {
  return (
    <Avatar className={cn("h-6 w-6 rounded-md", className)}>
      <AvatarImage alt={wallet.name} src={wallet.icon} />
      <AvatarFallback>{wallet.name[0]}</AvatarFallback>
    </Avatar>
  );
}

function WalletDropdownItem({ wallet }: { wallet: UiWallet }) {
  const { connect } = useWalletUiWallet({ wallet });

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      key={wallet.name}
      onClick={() => connect()}
    >
      {wallet.icon ? <WalletAvatar wallet={wallet} /> : null}
      {wallet.name}
    </DropdownMenuItem>
  );
}

function WalletDropdown() {
  const { account, connected, copy, disconnect, wallet, wallets } =
    useWalletUi();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="cursor-pointer" variant="outline">
          {wallet?.icon ? <WalletAvatar wallet={wallet} /> : null}
          {(() => {
            if (!connected) {
              return "Select Wallet";
            }
            if (account) {
              return ellipsify(account.address);
            }
            return wallet?.name;
          })()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {account ? (
          <>
            <DropdownMenuItem className="cursor-pointer" onClick={copy}>
              Copy address
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={disconnect}>
              Disconnect
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {wallets.length ? (
          wallets.map((w) => <WalletDropdownItem key={w.name} wallet={w} />)
        ) : (
          <DropdownMenuItem asChild className="cursor-pointer">
            <a
              href="https://solana.com/solana-wallets"
              rel="noopener noreferrer"
              target="_blank"
            >
              Get a Solana wallet to connect.
            </a>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { WalletDropdown };
