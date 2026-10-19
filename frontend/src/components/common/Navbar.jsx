import { useState } from "react";
import { NotebookPen, Search, LogOut, X } from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { toast } from "react-hot-toast";

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <NotebookPen className="text-blue-600" size={20} />
          <span className="font-bold text-gray-800">NoteKeeper</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search notes..."
            className="w-full pl-9 pr-8 py-1.5 text-sm bg-gray-100 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          {query && (
            <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          <span className="text-sm text-gray-600 hidden sm:block">{user?.fullName}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
