"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

export const DecrementButton = () => {
  const { sendAsync: decreaseCounter, isPending } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "decrease_counter",
  });

  const handleDecrement = async () => {
    try {
      await decreaseCounter();
    } catch (error) {
      console.error("Error decrementing counter:", error);
    }
  };

  return (
    <button
      className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 min-w-[120px] justify-center"
      onClick={handleDecrement}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Sending...</span>
        </>
      ) : (
        <>
          <span className="text-lg">−</span>
          <span>Decrement</span>
        </>
      )}
    </button>
  );
};