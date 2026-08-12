"use client";

import { createContext, useContext, useState, useCallback } from "react";

const MAX_COMPARE = 4;

interface CompareContextValue {
  slugs: string[];
  toggle: (slug: string) => void;
  clear: () => void;
  isSelected: (slug: string) => boolean;
  atLimit: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, slug];
    });
  }, []);

  const clear = useCallback(() => setSlugs([]), []);
  const isSelected = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return (
    <CompareContext.Provider value={{ slugs, toggle, clear, isSelected, atLimit: slugs.length >= MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
