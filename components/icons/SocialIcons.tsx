type IconProps = { size?: number; className?: string };

export function FacebookIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M15 8.5h2V5.5h-2c-2.2 0-4 1.8-4 4v2H9v3h2v6.5h3V14.5h2.2l.8-3H14v-2c0-.55.45-1 1-1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3.5a8.5 8.5 0 0 0-7.35 12.75L3.5 20.5l4.4-1.15A8.5 8.5 0 1 0 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8.7 8.6c.2-.45.4-.46.6-.47h.5c.17 0 .4-.06.6.47.25.6.85 2.05.9 2.2.06.15.1.32 0 .5-.1.2-.15.32-.3.5-.15.16-.3.36-.44.48-.15.15-.3.3-.13.6.17.3.75 1.24 1.6 2 1.1.98 2 1.28 2.32 1.42.3.15.5.13.68-.08.2-.2.8-.9 1-1.22.2-.3.4-.25.7-.15.28.1 1.8.86 2.1 1.02.3.15.5.22.58.35.08.13.08.75-.17 1.47-.25.72-1.5 1.4-2.05 1.42-.55.03-1.05.24-3.56-.75-3-1.18-4.9-4.2-5.05-4.4-.15-.2-1.2-1.6-1.2-3.05 0-1.45.75-2.16 1.02-2.46Z"
        fill="currentColor"
      />
    </svg>
  );
}