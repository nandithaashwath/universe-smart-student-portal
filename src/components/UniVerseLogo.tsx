interface UniVerseLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  subtitle?: string;
  className?: string;
}

export default function UniVerseLogo({
  size = 'md',
  iconOnly = false,
  showBadge = true,
  badgeText = 'SaaS',
  subtitle = 'Student Productivity',
  className = '',
}: UniVerseLogoProps) {
  // Dimensions mapping
  const sizeMap = {
    sm: { box: 'w-7 h-7', svg: 28, text: 'text-sm', sub: 'text-[10px]' },
    md: { box: 'w-9 h-9', svg: 36, text: 'text-base', sub: 'text-[11px]' },
    lg: { box: 'w-12 h-12', svg: 48, text: 'text-xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', svg: 64, text: 'text-2xl', sub: 'text-sm' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className={`${current.box} rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFF9F8] to-[#F9E9ED] border border-[#EAD6DC] shadow-[0_2px_8px_rgba(197,143,163,0.12)] flex items-center justify-center shrink-0 p-1 group transition-transform duration-200`}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="uv-rose-mauve-comp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D69CB0" />
              <stop offset="50%" stopColor="#C58FA3" />
              <stop offset="100%" stopColor="#A77C94" />
            </linearGradient>
            <linearGradient id="uv-star-comp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C58FA3" />
              <stop offset="100%" stopColor="#8F627B" />
            </linearGradient>
            <filter id="soft-shadow-comp" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#C58FA3" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Letter 'U' */}
          <path
            d="M 36 30 L 36 63 C 36 82 46 90 60 90 C 74 90 84 82 84 63 L 84 44"
            fill="none"
            stroke="url(#uv-rose-mauve-comp)"
            strokeWidth="11.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#soft-shadow-comp)"
          />

          {/* Subtle Open Book Folio Accent */}
          <path
            d="M 44 100 Q 52 96 60 98 Q 68 96 76 100"
            fill="none"
            stroke="#A77C94"
            strokeWidth="3.2"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Academic Star (Knowledge / Excellence Diamond) */}
          <path
            d="M 85 14 Q 85 24 75 24 Q 85 24 85 34 Q 85 24 95 24 Q 85 24 85 14 Z"
            fill="url(#uv-star-comp)"
            filter="url(#soft-shadow-comp)"
          />
          <circle cx="85" cy="24" r="1.5" fill="#FFF9F8" />
        </svg>
      </div>

      {/* Brand Wordmark (UniVerse) */}
      {!iconOnly && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`${current.text} font-bold text-[#39313A] tracking-tight font-sans`}>
              UniVerse
            </span>
            {showBadge && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#FFFFFF] text-[#A77C94] border border-[#EAD6DC] shadow-2xs">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`${current.sub} text-[#85808A] font-medium tracking-normal`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
