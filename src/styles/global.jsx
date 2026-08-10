// src/styles/global.jsx
// Estilos globais NÃO relacionados a tema (cores/light-dark ficam em theme.js).
// Aqui só regras estruturais agnósticas ao modo de cor.
import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
    button {
        transition: all 0.2s ease-in-out;
    }

    /* Mobile-first: respeita o notch e a barra inferior no iOS */
    #root {
        min-height: 100dvh;
        padding-bottom: env(safe-area-inset-bottom);
    }

    /* Campo de cor nativo sem a moldura padrão do browser */
    input[type="color"] {
        padding: 0;
        border: none;
        cursor: pointer;
    }
    input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
    }
    input[type="color"]::-webkit-color-swatch {
        border: none;
        border-radius: 6px;
    }
`;
