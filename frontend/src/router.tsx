import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './layout';


export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
           
        ],
    },
]); 