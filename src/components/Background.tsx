import { useEffect, useState } from 'react'
import { getBackground, onBackgroundChange } from '../lib/background'

const fallbackBg = `${import.meta.env.BASE_URL}background.jpg`

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
        style={{ backgroundImage: `url(${bg || fallbackBg})` }}
      />
      <div className="app-bg-overlay" aria-hidden="true" />
    </>
  )
}
