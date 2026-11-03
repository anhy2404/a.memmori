import React, { ReactNode } from 'react';

interface PageHeaderBannerProps {
  badge?: string;
  badgeIcon?: ReactNode;
  title: string;
  subtitle?: string;
  gradient?: string;
  bgImage?: string;
  children?: ReactNode;
  compact?: boolean;
}

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  badge,
  badgeIcon,
  title,
  subtitle,
  gradient = 'from-violet-700 via-indigo-600 to-purple-800',
  bgImage,
  children,
  compact = true,
}) => {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-lg border border-white/10 dark:border-white/5 transition-all">
      {/* Background Gradient & Optional Travel Scenery Photo */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${gradient}`} 
      />

      {bgImage && (
        <img
          src={bgImage}
          alt="Scenic Banner"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          loading="lazy"
        />
      )}

      {/* Decorative Light Glows */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Banner Content (Compact, sleek & well padded) */}
      <div className="relative z-10 px-5 py-4 sm:px-6 sm:py-5 text-white flex flex-col justify-between">
        <div className="space-y-1">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-xs">
              {badgeIcon}
              <span>{badge}</span>
            </div>
          )}

          <h2 className="text-base sm:text-xl font-black tracking-tight text-white leading-snug drop-shadow-xs">
            {title}
          </h2>

          {subtitle && (
            <p className="text-[11px] sm:text-xs text-white/85 max-w-lg leading-relaxed line-clamp-1 sm:line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Children (e.g. Search Bar or Quick Buttons) */}
        {children && (
          <div className="pt-2.5">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
