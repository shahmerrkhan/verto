import { useState, useEffect } from 'react'

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
}

export const TOUCH_TARGET = 44

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
}

export const COLORS = {
  bg: '#0d1117',
  surface: '#161b22',
  accent: '#f59e0b',
  text: '#e6edf3',
  textSecondary: '#7d8590',
  textMuted: '#484f58',
  green: '#3fb950',
  red: '#f85149',
}

export const COMPONENT = {
  opCard: {
    mobilePadding: '16px',
    desktopPadding: '20px',
    mobileGap: '10px',
    desktopGap: '12px',
    mobileButtonHeight: '44px',
    desktopButtonHeight: '40px',
  },
  leaderboard: {
    mobileStatsColumns: 1,
    tabletStatsColumns: 2,
    desktopStatsColumns: 3,
    mobileWinnerPadding: '16px',
    desktopWinnerPadding: '20px',
  },
  nav: {
    mobileHeight: '64px',
    desktopHeight: '80px',
  },
  button: {
    minHeight: '44px',
    padding: '9px 12px',
  },
}

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINTS.mobile)
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= BREAKPOINTS.mobile && window.innerWidth < BREAKPOINTS.desktop
  )
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= BREAKPOINTS.desktop)

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth
      setIsMobile(width < BREAKPOINTS.mobile)
      setIsTablet(width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop)
      setIsDesktop(width >= BREAKPOINTS.desktop)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { isMobile, isTablet, isDesktop }
}