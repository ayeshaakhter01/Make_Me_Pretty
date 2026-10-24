import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartProvider.jsx'
import { CatalogProvider } from './context/CatalogProvider.jsx'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CatalogProvider>
        <CartProvider><App /></CartProvider>
      </CatalogProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
