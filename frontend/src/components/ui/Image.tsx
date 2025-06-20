import { ImgHTMLAttributes } from 'react'

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  priority?: boolean
}

export function Image({ alt, priority, ...props }: ImageProps) {
  return (
    <img
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  )
}