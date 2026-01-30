import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React from "react";

type Props = {
  label: string;
  subLabel: string;
  description: string;
};

const DoubleGradientCard = ({ label, subLabel, description }: Props) => {
  return (
    <div className="relative border border-border/50 p-6 rounded-xl 
      flex flex-col gap-y-20 overflow-hidden
      bg-background transition-all duration-300
      hover:scale-[1] hover:border-transparent">

      {/* Top Content */}
      <div className="flex flex-col z-40">
        <h2 className="text-2xl font-semibold">{label}</h2>
        <p className="text-text-secondary text-sm mt-1">{subLabel}</p>
      </div>

      {/* Bottom Content */}
      <div className="flex justify-between items-center z-40 gap-x-10">
        <p className="text-text-secondary text-sm">{description}</p>
        <Button className="rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 w-10 h-10 p-0">
          <ArrowRight className="text-white" />
        </Button>
      </div>

      {/* Gradient Layers */}
      <div className="absolute inset-0 z-10">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full 
          bg-gradient-to-br from-purple-500/30 to-pink-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full 
          bg-gradient-to-br from-sky-500/30 to-cyan-400/20 blur-3xl" />
      </div>
    </div>
  );
};

export default DoubleGradientCard;