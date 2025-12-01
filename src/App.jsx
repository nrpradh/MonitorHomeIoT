import React, { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import Lenis from "lenis";

// Pages
import Home from "./pages/landing/main";
import NotFound from "./pages/not-found";

// ScrollToTop component
function ScrollToTop({ lenis }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // If Lenis exists, scroll using it; else fallback
    if (lenis) {
      lenis.scrollTo(0, { immediate: false});
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname, lenis]);

  return null;
}

export default function App() {
  const lenisRef = useRef();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.7,
      smooth: true,
      lerp: 0.2,
      wheelMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenisRef.current = null;
      delete window.lenis;
    };
  }, []);

  return (
    <BrowserRouter>
      {/* ScrollToTop runs on every route change */}
      <ScrollToTop lenis={lenisRef.current} />
      <main className="md:px-12 px-6">
        {/* <Navbar /> */}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
