import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Layout from './Layout'
import LandingPage from './pages/LandingPage'
import ClubHome from './pages/ClubHome'
import ClubGames from './pages/ClubGames'
import GameDetail from './pages/GameDetail'
import ClubTeams from './pages/ClubTeams'
import TeamDetail from './pages/TeamDetail'
import Standings from './pages/Standings'
import AssociationCompetitions from './pages/AssociationCompetitions'
import CompetitionPhases from './pages/CompetitionPhases'
import About from './pages/About'
import Install from './pages/Install'
import { ClubProvider } from './lib/ClubContext'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route element={<Layout />}>
                    <Route element={<ClubProvider><Outlet /></ClubProvider>}>
                        <Route path="clube/:clubSlug" element={<ClubHome />} />
                        <Route path="clube/:clubSlug/jogos" element={<ClubGames />} />
                        <Route path="clube/:clubSlug/jogo/:gameSlug" element={<GameDetail />} />
                        <Route path="clube/:clubSlug/equipas" element={<ClubTeams />} />
                        <Route path="clube/:clubSlug/equipa/:escalao" element={<TeamDetail />} />
                    </Route>
                    <Route path="standings" element={<Standings />} />
                    <Route path="standings/:associationId" element={<AssociationCompetitions />} />
                    <Route path="standings/:associationId/:competitionId" element={<CompetitionPhases />} />
                    <Route path="about" element={<About />} />
                    <Route path="install" element={<Install />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
export default App
