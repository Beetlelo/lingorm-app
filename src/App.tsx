import { Routes, Route, Navigate } from 'react-router-dom'
import Background from './components/Background'
import ScreenLayout from './components/ScreenLayout'
import Home from './screens/Home'
import Album from './screens/Album'
import Calendar from './screens/Calendar'
import Me from './screens/Me'
import Feed from './screens/Feed'
import Stats from './screens/Stats'
import Nearby from './screens/Nearby'
import Wishlist from './screens/Wishlist'
import Browse from './screens/Browse'
import QuickCategorize from './screens/QuickCategorize'
import Notifications from './screens/Notifications'
import EventDetail from './screens/EventDetail'
import AddPhoto from './screens/AddPhoto'
import EditProfile from './screens/EditProfile'

export default function App() {
  return (
    <>
      <Background />
      <div className="app-shell">
        <Routes>
          <Route element={<ScreenLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/album" element={<Album />} />
            <Route path="/trip" element={<Navigate to="/calendar" replace />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/me" element={<Me />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/nearby" element={<Nearby />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/categorize" element={<QuickCategorize />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/add-photo" element={<AddPhoto />} />
            <Route path="/edit-profile" element={<EditProfile />} />
          </Route>
        </Routes>
      </div>
    </>
  )
}
