/**
 * Digibank mark: sleek hexagonal shield with "D" cut, premium dark-theme design.
 * Matches --primary: #ff6b35 orange accent with dark gradient.
 */
type DigibankLogoProps = {
  className?: string;
  cutoutColor?: string;
};

export function DigibankLogo({ className = 'w-10 h-10', cutoutColor = 'var(--card)' }: DigibankLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>Digibank</title>
      <defs>
        {/* Dark body gradient */}
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1e2e" />
          <stop offset="100%" stopColor="#0d0d1a" />
        </linearGradient>
        {/* Orange glow gradient for border */}
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="60%" stopColor="#ff8c5a" />
          <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.4" />
        </linearGradient>
        {/* Orange glow filter */}
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Subtle inner glow */}
        <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shield body - dark gradient fill */}
      <path
        d="M50 6 L82 20 L82 52 C82 70 67 84 50 94 C33 84 18 70 18 52 L18 20 Z"
        fill="url(#shieldGrad)"
      />

      {/* Shield border - orange gradient */}
      <path
        d="M50 6 L82 20 L82 52 C82 70 67 84 50 94 C33 84 18 70 18 52 L18 20 Z"
        fill="none"
        stroke="url(#borderGrad)"
        strokeWidth="2.5"
        filter="url(#glow)"
      />

      {/* Inner shield facet lines for depth */}
      <path
        d="M50 16 L74 27 L74 51 C74 65 62 76 50 84"
        fill="none"
        stroke="#ff6b35"
        strokeWidth="0.6"
        strokeOpacity="0.2"
      />

      {/* "D" letter shape */}
      <g filter="url(#innerGlow)" fill="#ff6b35">
        <path d="M 35 32 L 35 68 L 48 68 C 62 68 68 60 68 50 C 68 40 62 32 48 32 Z M 42 39 L 48 39 C 55 39 59 43 59 50 C 59 57 55 61 48 61 L 42 61 Z" />
      </g>

      {/* Top highlight reflection */}
      <path
        d="M50 10 L76 22 L76 24 L50 13 L24 24 L24 22 Z"
        fill="white"
        fillOpacity="0.06"
      />
    </svg>
  );
}
