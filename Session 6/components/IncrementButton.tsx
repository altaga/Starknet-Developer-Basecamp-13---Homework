"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

export const IncrementButton = () => {
  const { sendAsync: increaseCounter, isPending } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "increase_counter",
  });

  const handleIncrement = async () => {
    try {
      await increaseCounter();
    } catch (error) {
      console.error("Error incrementing counter:", error);
    }
  };

  return (
    <button
      className="bg-[#00A3FF] hover:bg-[#0088CC] disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 min-w-[120px] justify-center"
      onClick={handleIncrement}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Sending...</span>
        </>
      ) : (
        <>
          <span className="text-lg">+</span>
          <span>Increment</span>
        </>
      )}
    </button>
  );
};