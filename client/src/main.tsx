import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { SocketProvider } from './components/providers/SocketProvider'
import { Toaster } from './components/ui/Toaster'
import './index.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SocketProvider>
          <App />
          <Toaster />
        </SocketProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)