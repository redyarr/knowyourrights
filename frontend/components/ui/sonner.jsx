"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";

const Toaster = ({...props}) => {
  const { theme = "system" } = useTheme()
  const [thm, setThm] = useState("system");

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "system";
    setThm(currentTheme);
  }, [theme]);

  return (
    (<Sonner
      theme={thm}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        }
      }
      {...props} />)
  );
}

export { Toaster }
