"use client"

import { useEffect, useRef, useState } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
  type: "cursor" | "ambient"
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, lastMoved: Date.now() })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isDark, setIsDark] = useState(false)

  // Theme-aware colors
  const lightColors = [
    "rgba(62, 187, 158, 0.4)", // #3ebb9e
    "rgba(64, 121, 255, 0.3)", // #4079ff
    "rgba(147, 51, 234, 0.2)", // purple
    "rgba(59, 130, 246, 0.2)", // blue
    "rgba(34, 197, 94, 0.2)", // green
  ]

  const darkColors = [
    "rgba(64, 255, 170, 0.6)", // #40ffaa
    "rgba(64, 121, 255, 0.6)", // #4079ff
    "rgba(62, 187, 158, 0.5)", // #3ebb9e
    "rgba(147, 51, 234, 0.4)", // purple
    "rgba(59, 130, 246, 0.4)", // blue
  ]

  useEffect(() => {
    // Check for dark mode
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    checkTheme()

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Initialize particles
    particlesRef.current = []

    const colors = isDark ? darkColors : lightColors

    const createParticle = (x: number, y: number, type: "cursor" | "ambient" = "cursor"): Particle => ({
      x,
      y,
      vx: (Math.random() - 0.5) * (type === "ambient" ? 0.5 : 2),
      vy: (Math.random() - 0.5) * (type === "ambient" ? 0.5 : 2),
      size: Math.random() * (type === "ambient" ? 2 : 3) + 1,
      opacity: Math.random() * (type === "ambient" ? 0.3 : 0.5) + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * (type === "ambient" ? 300 : 200) + 100,
      type,
    })

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, lastMoved: Date.now() }

      // Create particles near cursor
      if (Math.random() < 0.3) {
        const offsetX = (Math.random() - 0.5) * 100
        const offsetY = (Math.random() - 0.5) * 100
        particlesRef.current.push(createParticle(e.clientX + offsetX, e.clientY + offsetY, "cursor"))
      }
    }

    const animate = () => {
      // Clear canvas with theme-appropriate background
      if (isDark) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const now = Date.now()
      const timeSinceMouseMove = now - mouseRef.current.lastMoved
      const isMouseInactive = timeSinceMouseMove > 2000 // 2 seconds

      // Create more ambient particles when mouse is inactive
      if (isMouseInactive && Math.random() < 0.08) {
        particlesRef.current.push(
          createParticle(Math.random() * canvas.width, Math.random() * canvas.height, "ambient"),
        )
      } else if (!isMouseInactive && Math.random() < 0.02) {
        // Fewer ambient particles when mouse is active
        particlesRef.current.push(
          createParticle(Math.random() * canvas.width, Math.random() * canvas.height, "ambient"),
        )
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.life++

        // Different behavior for cursor vs ambient particles
        if (particle.type === "cursor" && !isMouseInactive) {
          // Move towards mouse with some randomness
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 200) {
            particle.vx += (dx / distance) * 0.02
            particle.vy += (dy / distance) * 0.02
          }
        }

        // Apply some drag
        particle.vx *= 0.99
        particle.vy *= 0.99

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around screen edges for ambient particles
        if (particle.type === "ambient") {
          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0
        }

        // Update opacity based on life
        particle.opacity = Math.max(0, 1 - particle.life / particle.maxLife) * (particle.type === "ambient" ? 0.4 : 0.6)

        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Add glow effect
        ctx.shadowBlur = particle.type === "ambient" ? 5 : 10
        ctx.shadowColor = particle.color
        ctx.fill()
        ctx.restore()

        return particle.life < particle.maxLife
      })

      // Connect nearby particles with lines (theme-aware)
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.save()
            ctx.globalAlpha = (1 - distance / 100) * 0.15
            ctx.strokeStyle = isDark ? "#40ffaa" : "#3ebb9e"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }

      // Limit particle count
      if (particlesRef.current.length > 200) {
        particlesRef.current = particlesRef.current.slice(-200)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener("mousemove", handleMouseMove)
    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: isDark
          ? "radial-gradient(ellipse at center, rgba(64, 255, 170, 0.03) 0%, rgba(64, 121, 255, 0.02) 50%, transparent 100%)"
          : "radial-gradient(ellipse at center, rgba(62, 187, 158, 0.02) 0%, rgba(64, 121, 255, 0.01) 50%, transparent 100%)",
      }}
    />
  )
}
