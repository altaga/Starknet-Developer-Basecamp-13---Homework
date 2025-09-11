"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

export const CounterDisplay = () => {
  const { data: counter, isLoading, error } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00A3FF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <span className="text-red-500 text-sm">Error loading counter</span>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        Counter Value
      </div>
      <div className="text-5xl font-bold text-[#00A3FF] mb-4">
        {counter?.toString() || "0"}
      </div>
    </div>
  );
};