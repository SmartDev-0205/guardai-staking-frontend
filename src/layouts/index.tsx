import { lazy, useEffect } from "react";
import { Outlet } from "react-router-dom";

// ---------------------------------------------------------------------------------------

const Navbar = lazy(() => import("./Navbar"));
const Footer = lazy(() => import("./Footer"));

// ---------------------------------------------------------------------------------------

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col  ">
      <div className="main-container fixed inset-0 h-full w-full opacity-10 object-cover" />
      {/* <Navbar /> */}
      <div className="flex-1 z-20 flex items-center justify-center">
        <Outlet />
      </div>
      {/* <Footer /> */}
    </div>
  );
}
