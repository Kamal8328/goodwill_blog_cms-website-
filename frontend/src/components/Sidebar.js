import { Link, useLocation, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { BiLogOut } from "react-icons/bi";
import { BsTags, BsFilePost } from 'react-icons/bs';
import { MdLibraryBooks, MdOutlineSpaceDashboard } from 'react-icons/md';
import { RiFileUserLine } from 'react-icons/ri';
import { TbCategoryPlus } from 'react-icons/tb';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 2. Initialize the hook

  // --- 3. THE LOGOUT FUNCTION ---
  const handleLogout = () => {
    // A. Ask for confirmation (Optional)
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    
    if (confirmLogout) {
      // B. Destroy the Token (The "Key")
      localStorage.removeItem("token");
      
      // C. Optional: Clear other user data
      localStorage.removeItem("adminName");
      localStorage.removeItem("adminEmail");

      // D. Redirect to Login Page
      navigate("/login");
    }
  };

  const menu = [
    { name: "Dashboard", path: "/", icons:<MdOutlineSpaceDashboard size={22}/> },
    { name: "Blog Posts", path: "/blogpost", icons:<BsFilePost size={22}/>},
    { name: "Categories", path: "/categories", icons:<TbCategoryPlus size={22}/>},
    { name: "Tags", path: "/tags", icons:<BsTags size={22}/> },
    { name: "Media Library", path: "/media", icons:<MdLibraryBooks size={22}/> },
    { name: "Counselling Data", path: "/counselling", icons:<RiFileUserLine size={22}/> },
    { name: "view", path: "/posts/view/:id", icons:<BsFilePost size={22}/> },
    
  ];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#1F3B8D] to-[#214CB4] text-white flex flex-col shadow-lg sticky top-0 h-screen overflow-y-auto">
      
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-white/30 shrink-0">
        <div className="w-8 h-8 bg-white/20 rounded-md backdrop-blur-sm flex items-center justify-center font-bold">A</div>
        <span className="ml-3 font-semibold text-lg tracking-wide">Admin Panel</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${
                location.pathname === item.path
                  ? "bg-white/20 font-bold shadow-lg shadow-blue-900/20"
                  : "hover:bg-white/10 hover:translate-x-1"
              }`}
          >
            <div className={`${location.pathname === item.path ? "text-white" : "text-blue-200 group-hover:text-white"}`}>
              {item.icons}
            </div>
            <span className="text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* --- 4. ATTACH THE FUNCTION TO THE BUTTON --- */}
      <button 
        onClick={handleLogout} 
        className="p-6 border-t border-white/20 flex items-center gap-3 cursor-pointer hover:bg-red-500/20 transition-colors mt-auto w-full text-left"
      >
        <BiLogOut size={22} className="text-red-200" />
        <span className="font-semibold text-red-100">Logout</span>
      </button>

    </aside>
  );
};

export default Sidebar;