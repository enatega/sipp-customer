import React from 'react';
import WalletBalanceCard from '../../../apps/deliveries/components/wallet/WalletBalanceCard';
import { useDeliveriesCurrencyLabel } from '../../stores/useAppConfigStore';

type Props = {
  balance: number | null | undefined;
  balanceLabel: string;
  buttonLabel: string;
  onPressWallet: () => void;
};

export default function WalletCard({ balance, balanceLabel, buttonLabel, onPressWallet }: Props) {
  const currency = useDeliveriesCurrencyLabel();

  return (
    <WalletBalanceCard
      balance={balance}
      balanceLabel={balanceLabel}
      currency={currency}
      actionLabel={buttonLabel}
      onAction={onPressWallet}
      isError={balance == null}
    />
  );
}
