import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Ticket, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
  onOpenBookings: () => void;
}

const UserMenu = ({ onOpenBookings }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg hover:border-primary transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="hidden sm:block text-foreground text-sm font-medium truncate max-w-[120px]">
          {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {/* User Info */}
              <div className="p-4 border-b border-border">
                <p className="font-medium text-foreground truncate">
                  {user?.user_metadata?.full_name || "User"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => {
                    onOpenBookings();
                    setIsOpen(false);
                  }}
                >
                  <Ticket className="w-4 h-4" />
                  <span>My Bookings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="p-2 border-t border-border">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
