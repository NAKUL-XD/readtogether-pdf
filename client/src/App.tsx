import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './layouts/Layout'
import { LandingPage } from './pages/LandingPage'
import { CreateRoomPage } from './pages/CreateRoomPage'
import { JoinRoomPage } from './pages/JoinRoomPage'
import { ReadingRoomPage } from './pages/ReadingRoomPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="create" element={<CreateRoomPage />} />
        <Route path="join" element={<JoinRoomPage />} />
        <Route path="join/:roomCode" element={<JoinRoomPage />} />
        <Route path="room/:roomId" element={<ReadingRoomPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App