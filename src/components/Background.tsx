import { useEffect, useState } from 'react'
import { getBackground, onBackgroundChange } from '../lib/background'

export default function Background() {
  const [bg, setBg] = useState<string | null>(null)

  useEffect(() => {
    setBg(getBackground())
    return onBackgroundChange(() => setBg(getBackground()))
  }, [])

  return (
    <>
      <div
        className="app-bg"
        aria-hidden="true"
        style={bg ? { backgroundImage: `url(${bg})` } : undefined}
      />
      <div className="app-bg-overlay" aria-hidden="true" />
    </>
  )
}
