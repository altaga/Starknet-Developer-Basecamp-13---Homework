"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "~~/hooks/useAccount";

export const SetCounter = () => {
  const [inputValue, setInputValue] = useState("");
  const { address: connectedAddress } = useAccount();

  // Read the contract owner
  const { data: contractOwner, isLoading: isLoadingOwner } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "owner",
  });

  const { sendAsync: setCounter, isPending } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "set_counter",
    args: [inputValue ? parseInt(inputValue) : 0],
  });

  // Normalize addresses to ensure proper comparison
  const normalizeAddress = (address: string | bigint | number) => {
    if (!address) return "";

    let hexAddress: string;

    // Handle different input types
    if (typeof address === 'bigint' || typeof address === 'number') {
      // Convert decimal/BigInt to hex
      hexAddress = BigInt(address).toString(16);
    } else if (typeof address === 'string') {
      // Handle string input (could be hex or decimal)
      if (address.startsWith('0x')) {
        hexAddress = address.slice(2);
      } else {
        // Assume it's a decimal string, convert to hex
        try {
          hexAddress = BigInt(address).toString(16);
        } catch {
          // If conversion fails, treat as hex string
          hexAddress = address;
        }
      }
    } else {
      return "";
    }

    // Pad with zeros to ensure 64 characters (32 bytes) and add 0x prefix
    const paddedAddress = hexAddress.padStart(64, "0");
    return `0x${paddedAddress}`.toLowerCase();
  };

  // Check if connected address is the owner
  const normalizedConnected = connectedAddress ? normalizeAddress(connectedAddress) : "";
  const normalizedOwner = contractOwner ? normalizeAddress(contractOwner) : "";
  const isOwner = normalizedConnected && normalizedOwner && normalizedConnected === normalizedOwner;

  // Debug logging (remove in production)
  console.log("Connected Address:", connectedAddress);
  console.log("Contract Owner:", contractOwner?.toString());
  console.log("Normalized Connected:", normalizedConnected);
  console.log("Normalized Owner:", normalizedOwner);
  console.log("Is Owner:", isOwner);

  const handleSetCounter = async () => {
    if (!inputValue || isNaN(parseInt(inputValue))) {
      alert("Please enter a valid number");
      return;
    }

    const value = parseInt(inputValue);
    if (value < 0) {
      alert("Please enter a positive number");
      return;
    }

    try {
      await setCounter({ args: [value] });
      setInputValue(""); // Clear input after successful transaction
    } catch (error) {
      console.error("Error setting counter:", error);
    }
  };

  if (isLoadingOwner) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          Set Custom Value
        </div>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8a45fc]"></div>
          <span className="ml-2 text-sm text-gray-500">Checking permissions...</span>
        </div>
      </div>
    );
  }

  if (!connectedAddress) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          Set Custom Value
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="text-yellow-600 dark:text-yellow-400">⚠️</div>
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Connect your wallet to set counter values
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          Set Custom Value
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-red-600 dark:text-red-400">🔒</div>
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Owner Only
            </span>
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 mb-2">
            Only the contract owner can set custom counter values
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="break-all">
              <span className="font-medium">Your Address:</span><br />
              {normalizedConnected || "Not connected"}
            </div>
            <div className="break-all">
              <span className="font-medium">Owner Address:</span><br />
              {normalizedOwner || "Loading..."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Set Custom Value
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
          Owner
        </div>
      </div>
      <div className="flex gap-3 items-center w-full max-w-xs">
        <input
          type="number"
          placeholder="0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#8a45fc] focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          min="0"
          disabled={isPending || !isOwner}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSetCounter();
            }
          }}
        />
        <button
          className="bg-[#8a45fc] hover:bg-[#7a3de8] disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 min-w-[80px] justify-center shadow-sm hover:shadow-md disabled:shadow-none"
          onClick={handleSetCounter}
          disabled={isPending || !inputValue || !isOwner}
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">Setting</span>
            </>
          ) : (
            <>
              <span>Set</span>
            </>
          )}
        </button>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Enter any positive number to set the counter
      </div>
    </div>
  );
};