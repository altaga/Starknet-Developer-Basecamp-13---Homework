"use client";
import { useAccount } from "~~/hooks/useAccount";
import { Address } from "./scaffold-stark";
import { useScaffoldStarkProfile } from "~~/hooks/scaffold-stark/useScaffoldStarkProfile";

export const ConnectedAddress = () => {
  const connectedAddress = useAccount();

  const { data: fetchedProfile, isLoading } = useScaffoldStarkProfile(
    connectedAddress.address,
  );

  if (!connectedAddress.address) {
    return (
      <div className="bg-base-200 px-4 py-2 rounded-lg">
        <span className="text-sm text-gray-500">No wallet connected</span>
      </div>
    );
  }

  return (
    <div className="bg-base-200 px-4 py-2 rounded-lg border border-base-300">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Connected:
        </span>
        <Address
          address={connectedAddress.address}
          profile={fetchedProfile}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
