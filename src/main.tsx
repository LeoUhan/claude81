import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppStoreProvider } from './store/AppStore'
import { RoleProvider } from './store/RoleContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <AppStoreProvider>
          <App />
        </AppStoreProvider>
      </RoleProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
