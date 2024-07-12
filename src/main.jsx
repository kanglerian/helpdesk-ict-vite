import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import './index.css'

import Students from './pages/Students';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Students/>,
  },
  {
    path: "/admin",
    element: <Admin/>,
  },
  {
    path: "/dashboard",
    element: <Dashboard/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
