import { Button } from "@/components/ui/button";
import React from "react";

type Props = {};

const PaymentButton = (props: Props) => {
  // Wip : get there subscription details
  //   wip : Loading state
  return (
    <Button className="bg-gradient-to-br text-white rounded-full from-[#9685DB] via-[#9434E6] to-[#CC3BD4] font-bold">
      Upgrade
    </Button>
  );
};

export default PaymentButton;
