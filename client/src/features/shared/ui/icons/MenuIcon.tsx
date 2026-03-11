import * as React from "react"

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <g clipPath="url(#clip0_429_11066)">
        <path
          d="M3 6.00092H21M3 12.0009H21M3 18.0009H21"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath>
          <rect
            width={24}
            height={24}
            fill="white"
            transform="translate(0 0.000915527)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default MenuIcon
