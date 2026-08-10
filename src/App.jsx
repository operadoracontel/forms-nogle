import React from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';

import RoutesList from './routes';
import GlobalStyle from './styles/global';
import theme from './styles/theme';

function App() {
    return (
        <>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <ChakraProvider theme={theme}>
                <RoutesList />
                <GlobalStyle />
            </ChakraProvider>
        </>
    );
}

export default App;
