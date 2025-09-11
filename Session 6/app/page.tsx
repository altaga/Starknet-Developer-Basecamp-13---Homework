import { ConnectedAddress } from "~~/components/ConnectedAddress";
import { CounterDisplay } from "~~/components/CounterDisplay";
import { CounterEventHistory } from "~~/components/CounterEventHistory";
import { DecrementButton } from "~~/components/DecrementButton";
import { IncrementButton } from "~~/components/IncrementButton";
import { ResetButton } from "~~/components/ResetButton";
import { SetCounter } from "~~/components/SetCounter";

const Home = () => {
  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Starknet Counter DApp</span>
        </h1>
        <div className="flex justify-center items-center mt-4">
          <ConnectedAddress />
        </div>
      </div>

      <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
        <div className="flex flex-col items-center gap-8">
          <div className="bg-base-100 p-8 rounded-2xl shadow-lg border border-base-200 max-w-md w-full">
            <CounterDisplay />
            <div className="flex gap-3 justify-center mb-6">
              <DecrementButton />
              <IncrementButton />
            </div>
            <div className="flex justify-center mb-6">
              <ResetButton />
            </div>
            <div className="border-t border-base-200 pt-6">
              <SetCounter />
            </div>
          </div>
          {
            <CounterEventHistory />
          }
        </div>
      </div>
    </div>
  );
};

export default Home;
