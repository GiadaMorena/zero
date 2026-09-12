import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-14 w-14 text-xl",
    xl: "h-28 w-28 text-4xl",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center font-black rounded-2xl bg-black text-white shadow-md overflow-hidden group ${sizeClasses[size]} ${className}`}
    >
      {/* Background yellow glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5E050] via-[#EAB308] to-[#121212] opacity-20 group-hover:opacity-40 transition-opacity" />
      
      {/* Metallic Z styling */}
      <span className="relative z-10 font-extrabold tracking-tighter bg-gradient-to-tr from-[#FEF08A] via-[#F5E050] to-[#CA8A04] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        Z
      </span>
      
      {/* Top right subtle yellow dot */}
      <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#F5E050] shadow-[0_0_8px_#F5E050]" />
    </div>
  );
}
