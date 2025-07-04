// container bagian awal

import { useState, useEffect } from "react";

export const useNavigation = (initialPage = "home") => {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("currentPage") || initialPage;
  });

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const goToPage = (page) => setCurrentPage(page);

  return {
    currentPage,
    goToHome: () => goToPage("home"),
    goToLogin: () => goToPage("login"),
    goToRegister: () => goToPage("register"),
    goToReset: () => goToPage("reset"),
  };
};