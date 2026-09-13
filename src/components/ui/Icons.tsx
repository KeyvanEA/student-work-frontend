import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Base({ children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconHome = (p: IconProps) => (
  <Base {...p}>
    <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2v-9Z" />
  </Base>
)

export const IconTasks = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M8.5 9.5h7M8.5 13h7M8.5 16.5h4" />
  </Base>
)

export const IconBriefcase = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2.5" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18" />
  </Base>
)

export const IconChat = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12a7.5 7.5 0 0 1-7.5 7.5H8L4 22v-4.2A7.5 7.5 0 0 1 12.5 4.5 7.5 7.5 0 0 1 20 12Z" />
  </Base>
)

export const IconUser = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Base>
)

export const IconBell = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" />
    <path d="M10 18a2 2 0 0 0 4 0" />
  </Base>
)

export const IconPlus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)

export const IconSearch = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.6-3.6" />
  </Base>
)

export const IconSettings = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3.2a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3.2a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z" />
  </Base>
)

export const IconLogout = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 5.5V4a1.5 1.5 0 0 0-1.5-1.5h-7A1.5 1.5 0 0 0 5 4v16a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 15 20v-1.5" />
    <path d="M19 12H9.5m9.5 0-3-3m3 3-3 3" />
  </Base>
)

export const IconBack = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 6l6 6-6 6" />
  </Base>
)

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 13 4 4L19 7" />
  </Base>
)

export const IconX = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Base>
)

export const IconDownload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
    <path d="M4 17v1.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V17" />
  </Base>
)

export const IconEye = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Base>
)

export const IconUpload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20V9m0 0-4 4m4-4 4 4" />
    <path d="M4 7V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5V7" />
  </Base>
)

export const IconWallet = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18M16.5 14.5h.01" />
  </Base>
)

export const IconFile = (p: IconProps) => (
  <Base {...p}>
    <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3Z" />
    <path d="M13.5 3v5.5H19" />
  </Base>
)

export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
)

export const IconMoney = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M14.5 9.5a2.6 2.6 0 0 0-2.5-1.5c-1.5 0-2.4.8-2.4 1.9 0 2.6 5 1.4 5 4.1 0 1.2-1 2-2.6 2a2.7 2.7 0 0 1-2.6-1.6M12 6.5v11" />
  </Base>
)

export const IconShield = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6l7-3Z" />
  </Base>
)

export const IconSparkle = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
  </Base>
)

export const IconArrowLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Base>
)

export const IconGrid = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </Base>
)

export const IconBolt = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />
  </Base>
)

export const IconArchive = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="4.5" rx="1.5" />
    <path d="M5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5M10 12.5h4" />
  </Base>
)

export const IconHandshake = (p: IconProps) => (
  <Base {...p}>
    <path d="m8 11.5 2.4-2.4a1.6 1.6 0 0 1 2.2 0l3.9 3.8" />
    <path d="M3.5 9 7 5.5h4l2 2-2.5 2.5a1.4 1.4 0 0 1-2 0L7.5 9" />
    <path d="M13 7.5h3.5L20.5 11M20.5 11v4.5L17 19l-3-3M3.5 9v5.5L7 18l2-2" />
  </Base>
)

export const IconWarning = (p: IconProps) => (
  <Base {...p}>
    <path d="M10.6 4.2 2.9 17.5A1.6 1.6 0 0 0 4.3 20h15.4a1.6 1.6 0 0 0 1.4-2.5L13.4 4.2a1.6 1.6 0 0 0-2.8 0Z" />
    <path d="M12 9.5v4M12 16.5h.01" />
  </Base>
)

export const IconSmile = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9 14.2a4 4 0 0 0 6 0M9.2 9.8h.01M14.8 9.8h.01" />
  </Base>
)

export const IconUsers = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9.5" cy="8" r="3.2" />
    <path d="M3.5 19.5a6 6 0 0 1 12 0M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.3a6 6 0 0 1 3 5.2" />
  </Base>
)

export const IconTag = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 11.2V5a1.5 1.5 0 0 1 1.5-1.5h6.2a1.5 1.5 0 0 1 1.06.44l7.3 7.3a1.5 1.5 0 0 1 0 2.12l-6.2 6.2a1.5 1.5 0 0 1-2.12 0l-7.3-7.3a1.5 1.5 0 0 1-.44-1.06Z" />
    <path d="M7.8 7.8h.01" />
  </Base>
)

export const IconTool = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.5 6.5a3.8 3.8 0 0 1 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a3.8 3.8 0 0 1-2-2Z" />
    <path d="M9 4 5 5 4 9l3.5 3.5" />
  </Base>
)

export const IconPackage = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 3 8 4v10l-8 4-8-4V7l8-4Z" />
    <path d="m4 7 8 4 8-4M12 11v10" />
  </Base>
)

export const IconChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
)

export const IconMenu = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
)
