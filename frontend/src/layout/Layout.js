import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { HiMenu } from "react-icons/hi";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow p-4 flex items-center">
          <button onClick={() => setIsOpen(true)}>
            <HiMenu size={24} />
          </button>
          <h1 className="ml-4 font-semibold">Admin Panel</h1>
        </header>

        <main className="flex-1 p-4">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;