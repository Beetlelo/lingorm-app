import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import StatusBar from './StatusBar'

// Sub-flow / detail screens should not show the bottom tab bar.
const NO_TAB_BAR = ['/browse', '/categorize', '/notifications', '/add-photo', '/edit-profile']

export default function ScreenLayout() {
  const { pathname } = useLocation()
  const showTabBar = !NO_TAB_BAR.includes(pathname) && !pathname.startsWith('/event/')

  return (
    <>
      <StatusBar />
      <main className="screen">
        <Outlet />
      </main>
      {showTabBar && <BottomNav />}
    </>
  )
}
