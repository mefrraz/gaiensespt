import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Game from './pages/Game'
import Standings from './pages/Standings'
import About from './pages/About'
import Install from './pages/Install'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="agenda" element={<Home />} />
                    <Route path="game/:slug" element={<Game />} />
                    <Route path="standings" element={<Standings />} />
                    <Route path="about" element={<About />} />
                    <Route path="install" element={<Install />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App

