import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function MainLayout() {
  return (
    <>
      <main className="screen">
        <Outlet />
      </main>
      <BottomNav />
    </>
  )
}
