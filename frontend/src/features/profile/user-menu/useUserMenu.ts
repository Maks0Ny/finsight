import { useState } from "react";

export function useUserMenu() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleMenu() {
    setIsOpen((current) => !current);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  return {
    isOpen,
    toggleMenu,
    closeMenu,
  };
}