"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "~~/hooks/useAccount";
import { universalStrkAddress, strkAbi } from "~~/utils/Constants";
import deployedContracts from "~~/contracts/deployedContracts";
import { useState } from "react";

export const ResetButton = () => {
  const { address: connectedAddress } = useAccount();
  const [isApproving, setIsApproving] = useState(false);

  // Payment amount required (1 STRK = 1e18 wei)
  const PAYMENT_AMOUNT = BigInt("1000000000000000000");
  const counterContractAddress = deployedContracts.sepolia.CounterContract.address;

  // Read user's STRK balance
  const { data: strkBalance } = useScaffoldReadContract({
    contractName: "Strk",
    functionName: "balance_of",
    args: [connectedAddress],
    abi: strkAbi,
    address: universalStrkAddress,
  });

  // Read current allowance
  const { data: currentAllowance } = useScaffoldReadContract({
    contractName: "Strk",
    functionName: "allowance",
    args: [connectedAddress, counterContractAddress],
    abi: strkAbi,
    address: universalStrkAddress,
  });

  const { sendAsync: resetCounter, isPending } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "reset_counter",
  });

  const { sendAsync: approveStrk } = useScaffoldWriteContract({
    contractName: "Strk",
    functionName: "approve",
    abi: strkAbi,
    address: universalStrkAddress,
  });

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await approveStrk({
        args: [counterContractAddress, PAYMENT_AMOUNT],
      });
    } catch (error) {
      console.error("Error approving STRK:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReset = async () => {
    // Show confirmation dialog before resetting
    const confirmed = window.confirm(
      "Are you sure you want to reset the counter to 0? This will cost 1 STRK token and cannot be undone."
    );
    
    if (!confirmed) {
      return;
    }

    try {
      await resetCounter();
    } catch (error) {
      console.error("Error resetting counter:", error);
    }
  };

  // Check if user has sufficient balance and allowance
  const hasBalance = strkBalance && BigInt(strkBalance.toString()) >= PAYMENT_AMOUNT;
  const hasAllowance = currentAllowance && BigInt(currentAllowance.toString()) >= PAYMENT_AMOUNT;
  const needsApproval = hasBalance && !hasAllowance;

  if (!connectedAddress) {
    return (
      <button
        className="bg-gray-400 text-white font-medium py-2 px-6 rounded-lg min-w-[120px] justify-center flex items-center gap-2 cursor-not-allowed"
        disabled
        title="Connect your wallet to reset the counter"
      >
        <span className="text-lg">↻</span>
        <span>Reset</span>
      </button>
    );
  }

  if (!hasBalance) {
    return (
      <button
        className="bg-gray-400 text-white font-medium py-2 px-6 rounded-lg min-w-[120px] justify-center flex items-center gap-2 cursor-not-allowed"
        disabled
        title="You need at least 1 STRK token to reset the counter"
      >
        <span className="text-lg">💰</span>
        <span>Need STRK</span>
      </button>
    );
  }

  if (needsApproval) {
    return (
      <button
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 min-w-[120px] justify-center"
        onClick={handleApprove}
        disabled={isApproving}
      >
        {isApproving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Approving...</span>
          </>
        ) : (
          <>
            <span className="text-lg">✓</span>
            <span>Approve STRK</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 min-w-[120px] justify-center"
      onClick={handleReset}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Resetting...</span>
        </>
      ) : (
        <>
          <span className="text-lg">↻</span>
          <span>Reset (1 STRK)</span>
        </>
      )}
    </button>
  );
};