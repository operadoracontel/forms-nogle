import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import AppIdentityPreview from './AppIdentityPreview';
import { getContrastRatio } from './previewUtils';

jest.mock('@chakra-ui/react', () => {
    const React = require('react');
    const View = ({ children }) => <div>{children}</div>;
    return { Box: View, Flex: View, Text: View, Button: ({ children, onClick, type }) => <button type={type} onClick={onClick}>{children}</button> };
});
let container;
let root;
beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT; });
test('sinaliza contraste baixo e oferece ajuste sem bloquear as cores escolhidas', () => {
    const onAutoContrast = jest.fn();
    act(() => root.render(<AppIdentityPreview primaryColor="#fff" contrastColor="#ffffff" onAutoContrast={onAutoContrast} />));
    expect(getContrastRatio('#000', '#fff')).toBe(21);
    expect(container.textContent).toContain('1.00:1 · Contraste de texto baixo');
    expect(container.querySelector('.app-identity-preview__text > div').style.color).toBe('rgb(255, 255, 255)');
    act(() => container.querySelector('button').click());
    expect(onAutoContrast).toHaveBeenCalledTimes(1);
});
test('logo, ícones e splash usam arquivos independentes com seus fundos', () => {
    act(() => root.render(<AppIdentityPreview primaryColor="#000" contrastColor="#fff" iconBackground="#abcdef" splashColor="#123456" logoUrl="blob:logo" iconUrl="blob:icon" splashImageUrl="blob:splash" name="Marca" />));
    expect(container.textContent).toContain('21.00:1 · Bom contraste de texto');
    expect(container.querySelector('.app-identity-preview__logo img').src).toBe('blob:logo');
    expect([...container.querySelectorAll('.app-identity-preview__icon img')].map((img) => img.src)).toEqual(['blob:icon', 'blob:icon']);
    expect(container.querySelector('.app-identity-preview__icon > div').style.background).toBe('rgb(171, 205, 239)');
    expect(container.querySelector('.app-identity-preview__splash img').src).toBe('blob:splash');
    expect(container.querySelector('.app-identity-preview__splash > div').style.background).toBe('rgb(18, 52, 86)');
});
