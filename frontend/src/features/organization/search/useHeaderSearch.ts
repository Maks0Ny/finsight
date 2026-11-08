import { useState } from "react";

export function useHeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  function toggleSearch() {
    setIsOpen((current) => !current);
  }

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
  }

  function changeQuery(value: string) {
    setQuery(value);
  }

  return {
    isOpen,
    query,
    toggleSearch,
    closeSearch,
    changeQuery,
  };
}