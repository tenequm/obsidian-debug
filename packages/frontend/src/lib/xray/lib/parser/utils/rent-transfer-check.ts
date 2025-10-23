export const rentTransferCheck = (amount: number) => {
  if (amount <= 4_120_320) {
    return true;
  }
  return false;
};
