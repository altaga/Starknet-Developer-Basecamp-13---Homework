"use client";

import { useScaffoldEventHistory } from "~~/hooks/scaffold-stark/useScaffoldEventHistory";
import { Address } from "./scaffold-stark";
import { useEffect, useState } from "react";

interface CounterChangedEvent {
  caller: string;
  old_value: number;
  new_value: number;
  reason: "Increase" | "Decrease" | "Reset" | "Set" | { [key: string]: any };
}

export const CounterEventHistory = () => {
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [latestBlockProcessed, setLatestBlockProcessed] = useState<bigint>(0n);

  // Fetch ALL historical events from the beginning (without watch to preserve fromBlock)
  const { data: historicalEvents, isLoading: isLoadingHistorical, error: historicalError } = useScaffoldEventHistory({
    contractName: "CounterContract",
    eventName: "CounterChanged",
    fromBlock: 0n, // Start from genesis block to get ALL events
    watch: false, // Don't watch to preserve fromBlock = 0
    blockData: true,
    transactionData: true,
    receiptData: true,
    enabled: true,
  });

  // Separate hook to watch for new events only (from the latest processed block)
  const { data: newEvents, isLoading: isLoadingNew } = useScaffoldEventHistory({
    contractName: "CounterContract",
    eventName: "CounterChanged",
    fromBlock: latestBlockProcessed > 0n ? latestBlockProcessed : undefined, // Start from latest processed block
    watch: true, // Watch for new events
    blockData: true,
    transactionData: true,
    receiptData: true,
    enabled: hasInitiallyLoaded && latestBlockProcessed > 0n, // Only enable after historical events are loaded
  });

  // Process historical events when they load
  useEffect(() => {
    if (historicalEvents && historicalEvents.length > 0) {
      setAllEvents(historicalEvents);
      // Find the latest block number from historical events
      const latestBlock = historicalEvents.reduce((max, event) => {
        const blockNum = event.block?.block_number ? BigInt(event.block.block_number) : 0n;
        return blockNum > max ? blockNum : max;
      }, 0n);
      setLatestBlockProcessed(latestBlock + 1n); // Start watching from next block
    } else if (historicalEvents && historicalEvents.length === 0) {
      // No historical events, start watching from block 0
      setAllEvents([]);
      setLatestBlockProcessed(1n);
    }
  }, [historicalEvents]);

  // Add new events to the existing list (avoiding duplicates)
  useEffect(() => {
    if (newEvents && newEvents.length > 0 && hasInitiallyLoaded) {
      setAllEvents(prevEvents => {
        // Create a map of existing events by transaction hash for efficient lookup
        const existingHashes = new Set(
          prevEvents.map(e => e.log?.transaction_hash).filter(Boolean)
        );

        // Filter out duplicates and add new events
        const uniqueNewEvents = newEvents.filter(e =>
          e.log?.transaction_hash && !existingHashes.has(e.log.transaction_hash)
        );

        if (uniqueNewEvents.length > 0) {
          // Add new events at the beginning (they're more recent)
          return [...uniqueNewEvents, ...prevEvents];
        }

        return prevEvents;
      });
    }
  }, [newEvents, hasInitiallyLoaded]);

  // Track when we've initially loaded to prevent blinking on subsequent updates
  useEffect(() => {
    if (!isLoadingHistorical && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoadingHistorical, hasInitiallyLoaded]);

  // Combine loading states and data
  const showLoadingSpinner = isLoadingHistorical && !hasInitiallyLoaded;
  const isLoading = isLoadingHistorical || isLoadingNew;
  const error = historicalError;
  const events = allEvents;


  const getReasonText = (reason: any) => {
    if (!reason) return "Unknown";

    // Handle string format
    if (typeof reason === "string") return reason;

    // Handle Cairo enum format - check for numeric values (0, 1, 2, 3)
    if (typeof reason === "number" || typeof reason === "bigint") {
      const reasonNum = Number(reason);
      switch (reasonNum) {
        case 0: return "Increase";
        case 1: return "Decrease";
        case 2: return "Reset";
        case 3: return "Set";
        default: return "Unknown";
      }
    }

    // Handle object with variant property
    if (reason.variant) {
      if (reason.variant.Increase !== undefined) return "Increase";
      if (reason.variant.Decrease !== undefined) return "Decrease";
      if (reason.variant.Reset !== undefined) return "Reset";
      if (reason.variant.Set !== undefined) return "Set";
    }

    // Handle direct enum object properties
    if (reason.Increase !== undefined) return "Increase";
    if (reason.Decrease !== undefined) return "Decrease";
    if (reason.Reset !== undefined) return "Reset";
    if (reason.Set !== undefined) return "Set";

    // Handle object with numeric keys
    if (typeof reason === "object" && reason !== null) {
      const keys = Object.keys(reason);
      if (keys.length === 1) {
        const key = keys[0];
        switch (key) {
          case "0": case "Increase": return "Increase";
          case "1": case "Decrease": return "Decrease";
          case "2": case "Reset": return "Reset";
          case "3": case "Set": return "Set";
        }
      }
    }

    return "Unknown";
  };

  const getReasonIcon = (reasonText: string) => {
    switch (reasonText) {
      case "Increase": return "📈";
      case "Decrease": return "📉";
      case "Reset": return "🔄";
      case "Set": return "⚙️";
      default: return "❓";
    }
  };

  const getReasonColor = (reasonText: string) => {
    switch (reasonText) {
      case "Increase": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "Decrease": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      case "Reset": return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
      case "Set": return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20";
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  if (error) {
    return (
      <div className="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-200 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Counter Event History
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            0 events
          </div>
        </div>
        <div className="text-center p-8 min-h-[200px] flex items-center justify-center">
          <span className="text-red-500 text-sm">Error loading events</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-200 w-full max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Counter Event History
          </h3>
          {/* Subtle indicator for background updates */}
          {isLoading && hasInitiallyLoaded && (
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="Checking for new events..."></div>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {events?.length || 0} events
        </div>
      </div>

      {/* Comprehensive debug section */}
      <details className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border">
        <summary className="text-xs cursor-pointer font-medium">🐛 Debug Information</summary>
        <div className="mt-2 space-y-2">
          <div className="text-xs">
            <strong>Hook State:</strong>
            <ul className="ml-4 mt-1">
              <li>isLoading: {String(isLoading)}</li>
              <li>error: {error ? String(error) : 'null'}</li>
              <li>events: {events ? `Array(${events.length})` : 'null/undefined'}</li>
              <li>fromBlock: 0n (fetching ALL history)</li>
              <li>watch: true (listening for new events)</li>
            </ul>
          </div>
          {(events && events.length > 0) && (
            <div className="text-xs">
              <strong>Sample Event Structure:</strong>
              <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-40">
                {JSON.stringify(events[0], (_, value) => {
                  if (typeof value === 'bigint') {
                    return value.toString() + 'n';
                  }
                  if (value instanceof Error) {
                    return value.toString();
                  }
                  if (typeof value === 'function') {
                    return '[Function]';
                  }
                  if (typeof value === 'symbol') {
                    return value.toString();
                  }
                  return value;
                }, 2)}
              </pre>
            </div>
          )}
          {error && (
            <div className="text-xs">
              <strong>Error Details:</strong>
              <pre className="mt-1 p-2 bg-red-100 dark:bg-red-900/20 rounded overflow-auto">
                {JSON.stringify(error, (_, value) => {
                  if (typeof value === 'bigint') {
                    return value.toString() + 'n';
                  }
                  if (value instanceof Error) {
                    return value.toString();
                  }
                  if (typeof value === 'function') {
                    return '[Function]';
                  }
                  if (typeof value === 'symbol') {
                    return value.toString();
                  }
                  return value;
                }, 2)}
              </pre>
            </div>
          )}
        </div>
      </details>

      {showLoadingSpinner ? (
        <div className="text-center p-8 min-h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00A3FF]"></div>
          <span className="ml-2 text-sm text-gray-500">Loading events...</span>
        </div>
      ) : (!events || events.length === 0) ? (
        <div className="text-center p-8 min-h-[200px] flex flex-col items-center justify-center">
          <div className="text-gray-400 text-4xl mb-2">📝</div>
          <p className="text-gray-500 dark:text-gray-400">
            No counter changes yet. Start by incrementing, decrementing, or setting the counter!
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Searching from block 0 for all historical events...
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {/* Sort events by block number (newest first) */}
          {events
            .sort((a, b) => {
              const blockA = a.block?.block_number || 0;
              const blockB = b.block?.block_number || 0;
              return Number(blockB) - Number(blockA);
            })
            .map((event, index) => {
              // Try both parsedArgs and raw args
              const args = (event.parsedArgs || event.args) as CounterChangedEvent;
              const reasonText = getReasonText(args?.reason);
              const reasonIcon = getReasonIcon(reasonText);
              const reasonColor = getReasonColor(reasonText);

              return (
                <div
                  key={`${event.log?.transaction_hash || event.transactionHash || 'unknown'}-${index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{reasonIcon}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${reasonColor}`}>
                        {reasonText}
                      </span>
                    </div>
                    {event.block && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Block #{event.block.block_number}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">From:</span>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {args?.old_value ?? 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">To:</span>
                      <div className="text-2xl font-bold text-[#00A3FF]">
                        {args?.new_value ?? 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Caller:</span>
                      <div className="mt-1">
                        {args?.caller ? (
                          <Address address={args.caller as `0x${string}`} />
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};