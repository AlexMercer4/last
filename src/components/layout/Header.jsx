import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, User, Menu, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const ROLE_LINKS = {
  student: ["Dashboard", "Appointments", "Messages", "Profile"],
  counselor: [
    "Dashboard",
    "Appointments",
    "Students",
    "Messages",
    "Analytics",
    "Profile",
  ],
  chairperson: ["Dashboard", "User Management", "Analytics", "Profile"],
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const isUnauthenticated = !isAuthenticated || !user?.role;
  const links = isUnauthenticated ? [] : ROLE_LINKS[user.role] || [];
  const active = (link) => pathname.includes(link.toLowerCase());

  return (
    <header className="bg-[#0056b3] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-[#ffbc3b] p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              Student Counselor Platform
            </span>
            <span className="font-bold text-lg sm:hidden">SCCP</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1 flex-1 justify-center">
            {links.map((link) => (
              <Link
                key={link}
                to={`/${link.toLowerCase().replace(" ", "-")}`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap 
                  ${active(link) ? "bg-[#ffbc3b]" : "hover:bg-white/10"}`}
              >
                {link}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {!isUnauthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 relative p-2"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-white hover:bg-white/10 px-2 md:px-3"
                    >
                      <User className="h-5 w-5" />
                      <span className="hidden sm:block text-sm">
                        {user?.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Account</DropdownMenuItem>
                    <DropdownMenuItem>Help & Support</DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {isUnauthenticated && (
              <Button
                asChild
                variant="ghost"
                className="hidden md:flex text-white hover:bg-white/10"
              >
                <Link to="/login">Login</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/10 p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {links.map((link) => (
                <Link
                  key={link}
                  to={`/${link.toLowerCase().replace(" ", "-")}`}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors
                    ${active(link) ? "bg-[#ffbc3b]" : "hover:bg-white/10"}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </Link>
              ))}

              {isUnauthenticated ? (
                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-white hover:bg-white/10 justify-start mt-2"
                >
                  <Link to="/login">Login</Link>
                </Button>
              ) : (
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="w-full text-red-300 hover:bg-red-500/10 justify-start mt-2"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
