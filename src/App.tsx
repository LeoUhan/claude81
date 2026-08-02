import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AgentChat from './pages/AgentChat'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Actions from './pages/Actions'
import Efficiency from './pages/Efficiency'
import Retrospective from './pages/Retrospective'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agent" element={<AgentChat />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/actions" element={<Actions />} />
        <Route path="/efficiency" element={<Efficiency />} />
        <Route path="/retrospective" element={<Retrospective />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
