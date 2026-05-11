interface IconProps {
  name: string
  className?: string
  filled?: boolean
  style?: React.CSSProperties
}

import React from 'react'

export default function Icon({ name, className = '', filled = false, style }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded select-none ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
    >
      {name}
    </span>
  )
}
