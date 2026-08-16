export default function Logo({ withWordmark = true, size = 32 }) {
  return (
    <span className="logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="16" fill="var(--color-primary)" />
        <path
          d="M16 7c-4 3-6 6.5-6 10a6 6 0 0 0 12 0c0-3.5-2-7-6-10Z"
          fill="var(--color-primary-tint)"
        />
        <path
          d="M16 12c-2 1.8-3 3.6-3 5a3 3 0 0 0 6 0c0-1.4-1-3.2-3-5Z"
          fill="var(--color-primary)"
        />
      </svg>
      {withWordmark && <span className="logo__wordmark">AgriTrust</span>}
    </span>
  )
}
