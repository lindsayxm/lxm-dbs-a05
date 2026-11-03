/** The leader's crown. Gold with a soft glow. */
export function Crown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="var(--color-gold)"
      stroke="var(--color-gold)"
      strokeWidth="1"
      strokeLinejoin="round"
      style={{ filter: "drop-shadow(0 0 0.4rem rgb(255 197 61 / 0.8))" }}
      aria-label="Leader"
      role="img"
    >
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-1.6 10H4.6L3 8z" />
      <rect x="4.6" y="18" width="14.8" height="2.4" rx="0.6" />
    </svg>
  );
}
