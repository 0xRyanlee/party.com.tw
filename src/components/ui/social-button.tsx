import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  provider: "line" | "apple" | "google";
  children: ReactNode;
}

export function SocialButton({ icon, provider, children, className, ...props }: SocialButtonProps) {
  const variants = {
    line: "bg-[#06C755] hover:bg-[#05b34c] text-white border-none",
    apple: "bg-white hover:bg-gray-50 text-black border-none",
    google: "bg-[#2C2C2E] hover:bg-[#3a3a3c] text-white border-none",
  };

  return (
    <Button
      className={cn(
        "w-full h-12 rounded-full text-base font-medium relative",
        variants[provider],
        className
      )}
      {...props}
    >
      <span className="absolute left-4 flex items-center justify-center w-6 h-6">
        {icon}
      </span>
      {children}
    </Button>
  );
}
