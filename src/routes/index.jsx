import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import FormularioPage from '../pages/Formulario';
import LinkInvalido from '../pages/Status/LinkInvalido';

// O token do link é a rota inteira: nogle.tech/<token>. Sem token não há tela.
const router = createBrowserRouter([
    {
        path: '/',
        element: <LinkInvalido />,
    },
    {
        path: '/:token',
        element: <FormularioPage />,
    },
    {
        path: '*',
        element: <LinkInvalido />,
    },
]);

const RoutesList = () => <RouterProvider router={router} />;

export default RoutesList;
