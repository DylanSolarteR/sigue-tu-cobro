"use client";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui";
import Link from "next/link";

function Return() {
  const path = usePathname();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Link
            href={"/dashboard"}
            className={`${path === "/dashboard" ? "hidden" : "flex"} p items-center justify-center rounded-lg p-2 hover:bg-[#10473A]`}
          >
            <ChartNoAxesCombined size={16} />
          </Link>
        </TooltipTrigger>
        <TooltipContent className="bg-accent/50">
          <p>Volver al resumen</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default Return;
