import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Game from './pages/Game'
import About from './pages/About'
import Install from './pages/Install'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="game/:slug" element={<Game />} />
                    <Route path="about" element={<About />} />
                    <Route path="install" element={<Install />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App

