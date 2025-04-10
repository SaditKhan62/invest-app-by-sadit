import { Link } from "wouter";
import { 
  BarChart3, 
  Wallet, 
  User as UserIcon,
  Trophy
} from "lucide-react";

type MobileNavigationProps = {
  location: string;
};

export default function MobileNavigation({ location }: MobileNavigationProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-dark-600 py-2 shadow-lg z-50">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center px-3 py-2 cursor-pointer ${location === '/' ? 'text-primary' : 'text-white/70'}`}>
            <BarChart3 className="mb-1 h-5 w-5" />
            <span className="text-xs">Home</span>
          </div>
        </Link>
        <Link href="/portfolio">
          <div className={`flex flex-col items-center px-3 py-2 cursor-pointer ${location === '/portfolio' ? 'text-primary' : 'text-white/70'}`}>
            <Wallet className="mb-1 h-5 w-5" />
            <span className="text-xs">Portfolio</span>
          </div>
        </Link>
        <Link href="/earn">
          <div className={`flex flex-col items-center px-3 py-2 cursor-pointer ${location === '/earn' ? 'text-primary' : 'text-white/70'}`}>
            <Trophy className="mb-1 h-5 w-5" />
            <span className="text-xs">Earn</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className={`flex flex-col items-center px-3 py-2 cursor-pointer ${location === '/settings' ? 'text-primary' : 'text-white/70'}`}>
            <UserIcon className="mb-1 h-5 w-5" />
            <span className="text-xs">Account</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
