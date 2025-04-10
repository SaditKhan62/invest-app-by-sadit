import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { 
  BarChart3, 
  Search, 
  Wallet, 
  Bell, 
  Newspaper, 
  Settings, 
  HelpCircle,
  LogOut,
  Trophy
} from "lucide-react";

type SidebarProps = {
  user: User | null;
};

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:w-64 flex-shrink-0 flex-col h-screen p-4 bg-black/30 backdrop-blur-md border-r border-white/5">
      <div className="flex items-center justify-center mb-8 mt-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">NextGen Trading</h1>
        </div>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link href="/">
              <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${location === '/' ? 'bg-white/10 text-primary' : 'text-white/70 hover:bg-white/5'}`}>
                <BarChart3 className="w-6 h-6" />
                <span className="ml-3">Dashboard</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/portfolio">
              <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${location === '/portfolio' ? 'bg-white/10 text-primary' : 'text-white/70 hover:bg-white/5'}`}>
                <Wallet className="w-6 h-6" />
                <span className="ml-3">Portfolio</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/earn">
              <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${location === '/earn' ? 'bg-white/10 text-primary' : 'text-white/70 hover:bg-white/5'}`}>
                <Trophy className="w-6 h-6" />
                <span className="ml-3">Earn</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/news">
              <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${location === '/news' ? 'bg-white/10 text-primary' : 'text-white/70 hover:bg-white/5'}`}>
                <Newspaper className="w-6 h-6" />
                <span className="ml-3">News</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="pt-4 border-t border-white/10">
        <Link href="/settings">
          <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${location === '/settings' ? 'bg-white/10 text-primary' : 'text-white/70 hover:bg-white/5'}`}>
            <Settings className="w-6 h-6" />
            <span className="ml-3">Settings</span>
          </div>
        </Link>
        <Link href="/help">
          <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${location === '/help' ? 'bg-white/10 text-primary' : 'text-white/70 hover:bg-white/5'}`}>
            <HelpCircle className="w-6 h-6" />
            <span className="ml-3">Help</span>
          </div>
        </Link>
        <Link href="/auth">
          <div className="flex items-center px-4 py-3 rounded-lg cursor-pointer text-white/70 hover:bg-white/5">
            <LogOut className="w-6 h-6" />
            <span className="ml-3">{user ? 'Log Out' : 'Sign In'}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
