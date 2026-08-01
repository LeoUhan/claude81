import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppStoreProvider } from './store/AppStore'
import { RoleProvider } from './store/RoleContext'
import { AgentProvider } from './store/AgentContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <AppStoreProvider>
          <AgentProvider>
            <App />
          </AgentProvider>
        </AppStoreProvider>
      </RoleProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
