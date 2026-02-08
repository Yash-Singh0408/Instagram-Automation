import { Button } from "@/components/ui/button";
import { PLANS } from "@/constants/pages";
import { cn } from "@/lib/utils";
import { CircleCheck } from "lucide-react";
import React from "react";

type Props = {
  label: string;
  current: "PRO" | "FREE";
  landing?: boolean;
};

const PaymentCard = ({ label, current, landing }: Props) => {
  return (
    <div
      className={cn(
        label !== current
          ? "bg-in-active"
          : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
        "p-[2px] rounded-xl overflow-hidden h-full"
      )}
    >
      <div
        className={cn(
          landing && "radial--gradient--pink",
          "flex flex-col h-full rounded-xl pl-5 py-5 pr-10 bg-background-90"
        )}
      >
        {/* CONTENT */}
        <div className="flex flex-col flex-1 ">
          {landing ? (
            <h2 className="text-2xl">
              {label === "PRO" && "Premium Plan"}
              {label === "FREE" && "Standard"}
            </h2>
          ) : (
            <h2 className="text-2xl">
              {label === current
                ? "Your Current Plan"
                : current === "PRO"
                ? "Downgrade"
                : "Upgrade"}
            </h2>
          )}

          <p className="text-text-secondary text-sm mb-2">
            This is what your plan covers for you.
          </p>

          {label === "PRO" ? (
            <span className="bg-gradient-to-r text-3xl from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">
              Smart AI Plan
            </span>
          ) : (
            <p className="font-bold mt-2 text-text-secondary">Standard</p>
          )}

          {label === "PRO" ? (
            <p className="mb-4">
              <b className="text-xl">$59</b>/month
            </p>
          ) : (
            <p className="text-xl mb-4">Free</p>
          )}

          <div className="flex flex-col gap-y-2">
            {PLANS[label === "PRO" ? 1 : 0].features.map((i) => (
              <p key={i} className="text-muted-foreground flex gap-4">
                <CircleCheck className="text-indigo-500" /> {i}
              </p>
            ))}
          </div>
        </div>

        {/* BUTTON (always bottom aligned) */}
        {landing ? (
          <Button
            className={cn(
              "rounded-full mt-6",
              label === "PRO"
                ? "bg-gradient-to-r from-indigo-500 text-white via-purple-500 to-pink-500"
                : "bg-background-80 text-white hover:text-background-80"
            )}
          >
            {label === current
              ? "Get Started"
              : current === "PRO"
              ? "Free"
              : "Get Started"}
          </Button>
        ) : (
          <Button
            className="rounded-full mt-6 bg-background-80 text-white hover:text-background-80"
            disabled={label === current}
          >
            {label === current
              ? "Active Plan"
              : current === "PRO"
              ? "Downgrade"
              : "Upgrade"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;