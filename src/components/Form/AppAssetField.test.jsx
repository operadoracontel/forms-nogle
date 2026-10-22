import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import AppAssetField from './AppAssetField';
import { readImageDimensions } from '../../utils/appAssets';

jest.mock('@chakra-ui/react', () => {
    const React = require('react');
    const View = ({ children }) => <div>{children}</div>;
    return { Box: View, Flex: View, Text: View, FormControl: View, FormErrorMessage: View,
        Image: ({ src, alt }) => <img src={src} alt={alt} />,
        Button: ({ children, onClick, type, 'aria-label': label, isLoading }) => <button type={type} onClick={onClick} aria-label={label} disabled={isLoading}>{children}</button> };
});
jest.mock('../../utils/appAssets', () => ({ ...jest.requireActual('../../utils/appAssets'), readImageDimensions: jest.fn() }));

let container;
let root;
let onChange;
const file = (name = 'icon.png', type = 'image/png') => new File(['x'], name, { type });
const render = async (props = {}) => act(async () => root.render(<AppAssetField label="Ícone do aplicativo" kind="icon" onChange={onChange} {...props} />));
const select = async (value) => {
    const input = container.querySelector('input');
    Object.defineProperty(input, 'files', { configurable: true, value: [value] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
};
beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    URL.createObjectURL = jest.fn((value) => `blob:${value.name}`);
    URL.revokeObjectURL = jest.fn();
    readImageDimensions.mockReset().mockResolvedValue({ width: 512, height: 512 });
    onChange = jest.fn();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT; });

test('ícone fora de 512×512 informa dimensões e preserva o arquivo anterior', async () => {
    const previous = file('anterior.png');
    await render({ value: previous });
    readImageDimensions.mockResolvedValue({ width: 511, height: 512 });
    await select(file());
    expect(onChange).not.toHaveBeenCalled();
    expect(container.textContent).toContain('511×512');
    expect(container.querySelector('img').src).toContain('anterior.png');
    expect(container.querySelector('input').value).toBe('');
});

test('aplica um PNG válido e permite remover o ícone sem submeter o formulário', async () => {
    const valid = file();
    await render();
    await select(valid);
    expect(onChange).toHaveBeenCalledWith(valid);
    await render({ value: valid });
    act(() => container.querySelector('[aria-label="Remover Ícone do aplicativo"]').click());
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect([...container.querySelectorAll('button')].every((button) => button.type === 'button')).toBe(true);
});

test('formato incorreto é recusado antes de decodificar e logo SVG é aceito', async () => {
    await render();
    await select(file('icon.jpg', 'image/jpeg'));
    expect(container.textContent).toContain('O ícone deve ser um arquivo PNG');
    expect(readImageDimensions).not.toHaveBeenCalled();
    await render({ label: 'Logo do aplicativo', kind: 'logo' });
    const svg = file('logo.svg', 'image/svg+xml');
    await select(svg);
    expect(onChange).toHaveBeenCalledWith(svg);
});

test('desmontar durante a leitura aborta o trabalho e não aplica resultado atrasado', async () => {
    let resolve;
    readImageDimensions.mockImplementation(() => new Promise((done) => { resolve = done; }));
    await render();
    await select(file());
    const signal = readImageDimensions.mock.calls[0][1];
    await act(async () => root.render(null));
    expect(signal.aborted).toBe(true);
    await act(async () => resolve({ width: 512, height: 512 }));
    expect(onChange).not.toHaveBeenCalled();
});
