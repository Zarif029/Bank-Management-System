/**
 * NeoVault mark: sleek hexagonal shield with "NV" cut, premium dark-theme design.
 * Matches --primary: #ff6b35 orange accent with dark gradient.
 */
type NeoVaultLogoProps = {
  className?: string;
  cutoutColor?: string;
};

export function NeoVaultLogo({ className = 'w-10 h-10', cutoutColor = 'var(--card)' }: NeoVaultLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>NeoVault</title>
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

      {/* "N" letter shape */}
      <g filter="url(#innerGlow)" fill="#ff6b35">
        <path d="M28 35 L28 65 L34 65 L34 46 L46 65 L52 65 L52 35 L46 35 L46 54 L34 35 Z" />
      </g>

      {/* "V" letter shape */}
      <g filter="url(#innerGlow)" fill="#ff8c5a">
        <path d="M53 35 L62 62 L66 62 L75 35 L69 35 L64 55 L59 35 Z" />
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
