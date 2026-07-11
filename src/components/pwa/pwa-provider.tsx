"use client";

import { useEffect, useState } from "react";
import { InstallPrompt } from "./install-prompt";
import { UpdatePrompt } from "./update-prompt";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && (
        <>
          <InstallPrompt />
          <UpdatePrompt />
        </>
      )}
    </>
  );
}
