import { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

interface NavbarProps {
  session: { name: string; role: string } | null;
  navigate: (s: string) => void;
  title?: string;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Navbar({ session, navigate, title = '' }: NavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center gap-4">
      {/* Left: Screen title */}
      <div className="w-48 shrink-0">
        {title && (
          <h2 className="text-slate-800 font-semibold text-base truncate">{title}</h2>
        )}
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search symptoms, remedies..."
            className="jc-input pl-9 w-full cursor-pointer"
            readOnly
            onFocus={() => {
              setSearchFocused(true);
              navigate('rubric-search');
            }}
            onClick={() => navigate('rubric-search')}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search symptoms and remedies"
            data-focused={searchFocused}
          />
        </div>
      </div>

      {/* Right: Bell + Avatar + Name */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Bell with badge */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span
            className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none"
            aria-label="3 notifications"
          >
            3
          </span>
        </button>

        {/* Avatar + name + chevron */}
        {session && (
          <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors">
            {/* Initials avatar */}
            <span
              className="flex items-center justify-center rounded-full bg-jc-purple-700 text-white font-semibold text-sm select-none shrink-0"
              style={{ width: 36, height: 36 }}
              aria-hidden="true"
            >
              {getInitials(session.name)}
            </span>

            {/* Name (hidden on small screens) */}
            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {session.name}
            </span>

            <ChevronDown size={16} className="text-slate-400 hidden sm:block" />
          </button>
        )}
      </div>
    </header>
  );
}
