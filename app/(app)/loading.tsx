export default function Loading() {
  return (
    <div className="pt-6 px-4">
      {/* Section header skeleton */}
      <div
        className="h-[11px] w-[90px] rounded-[2px] mb-4 mt-2"
        style={{
          backgroundColor: 'rgba(197, 184, 157, 0.5)',
          animation: 'skeletonPulse 1.5s ease-in-out infinite',
        }}
      />

      {/* Task row skeletons */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Checkbox placeholder */}
            <div
              className="w-[22px] h-[22px] rounded-[3px] shrink-0"
              style={{
                backgroundColor: 'rgba(197, 184, 157, 0.5)',
                animation: `skeletonPulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 100}ms`,
              }}
            />
            {/* Text line placeholder */}
            <div
              className="h-[14px] rounded-[2px]"
              style={{
                width: `${55 + i * 8}%`,
                backgroundColor: 'rgba(197, 184, 157, 0.5)',
                animation: `skeletonPulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Second section skeleton */}
      <div
        className="h-[11px] w-[110px] rounded-[2px] mb-4 mt-8"
        style={{
          backgroundColor: 'rgba(197, 184, 157, 0.5)',
          animation: 'skeletonPulse 1.5s ease-in-out infinite',
          animationDelay: '200ms',
        }}
      />

      <div className="flex flex-col gap-4">
        {[5, 6, 7].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-[22px] h-[22px] rounded-[3px] shrink-0"
              style={{
                backgroundColor: 'rgba(197, 184, 157, 0.5)',
                animation: `skeletonPulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 100}ms`,
              }}
            />
            <div
              className="h-[14px] rounded-[2px]"
              style={{
                width: `${45 + i * 6}%`,
                backgroundColor: 'rgba(197, 184, 157, 0.5)',
                animation: `skeletonPulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
