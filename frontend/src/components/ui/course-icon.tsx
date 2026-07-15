import React from 'react';

interface CourseIconProps {
  icon: string | undefined;
  className?: string;
  fallback?: string;
}

export function CourseIcon({ icon, className = "w-4 h-4", fallback = "📚" }: CourseIconProps) {
  if (!icon) return <span>{fallback}</span>;
  if (icon.startsWith('data:image/')) {
    return (
      <img
        src={icon}
        alt="icon"
        className={`${className} object-cover rounded-md inline-block shrink-0`}
      />
    );
  }
  return <span className="shrink-0">{icon}</span>;
}
