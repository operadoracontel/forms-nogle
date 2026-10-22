import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import BrandCombobox from './BrandCombobox';
import { getBrandCatalog } from '../../services/api';

jest.mock('../../services/api', () => ({ getBrandCatalog: jest.fn() }));
jest.mock('@chakra-ui/react', () => {
    const React = require('react');
    const View = ({ as = 'div', children, ...props }) => React.createElement(as,
        Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('aria-')
            || /^on[A-Z]/.test(key) || ['id', 'role', 'type', 'tabIndex', 'htmlFor'].includes(key))), children);
    const Input = ({ isDisabled, fontSize, ...props }) => <input {...props} disabled={isDisabled} />;
    return {
        Box: View, Flex: View, HStack: View, Text: View, FormControl: View,
        FormLabel: (props) => <View as="label" {...props} />,
        FormErrorMessage: View, FormHelperText: View, Spinner: () => <span />,
        Button: (props) => <View as="button" {...props} />, Input,
    };
});

const netcel = Object.freeze({ id: 617, name: 'NETCEL TELECOM' });
const netcom = Object.freeze({ id: 83, name: 'NETCOM' });
let container;
let root;
let changed;

const Harness = ({ initialValue = null }) => {
    const [value, setValue] = useState(initialValue);
    return <>
        <BrandCombobox value={value} onChange={(brand) => { changed(brand); setValue(brand); }} />
        <output>{JSON.stringify(value)}</output>
    </>;
};
const render = async (initialValue = null) => {
    await act(async () => root.render(<Harness initialValue={initialValue} />));
};
const input = () => container.querySelector('[role="combobox"]');
const selection = () => JSON.parse(container.querySelector('output').textContent);
const focus = async () => { await act(async () => input().focus()); };
const type = async (text) => {
    await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input(), text);
        input().dispatchEvent(new Event('input', { bubbles: true }));
    });
};
const blur = async () => { await act(async () => input().blur()); };

beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    getBrandCatalog.mockReset();
    changed = jest.fn();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});

afterEach(() => {
    if (root) act(() => root.unmount());
    container.remove();
    delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('carrega o catálogo brands e apresenta nomes e IDs originais do ERP', async () => {
    getBrandCatalog.mockResolvedValue({ data: { brands: [netcel, netcom] } });
    await render();
    await focus();
    expect(getBrandCatalog).toHaveBeenCalledTimes(1);
    expect(getBrandCatalog.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal);
    expect(input().disabled).toBe(false);
    expect([...container.querySelectorAll('[role="option"]')].map((option) => option.textContent))
        .toEqual(['NETCEL TELECOM#617', 'NETCOM#83']);
    expect(selection()).toBeNull();
});

test('netcell só resolve no blur para o nome e ID canônicos únicos', async () => {
    getBrandCatalog.mockResolvedValue({ data: { brands: [netcel] } });
    await render();
    await focus();
    await type('netcell');
    expect(input().value).toBe('netcell');
    expect(selection()).toBeNull();
    expect(changed).toHaveBeenLastCalledWith(null);
    await blur();
    expect(changed).toHaveBeenLastCalledWith(netcel);
    expect(changed.mock.calls.at(-1)[0]).toBe(netcel);
    expect(selection()).toEqual({ id: 617, name: 'NETCEL TELECOM' });
    expect(input().value).toBe('NETCEL TELECOM');
});

test('nome desconhecido limpa a seleção anterior e não cria marca com o texto digitado', async () => {
    getBrandCatalog.mockResolvedValue({ data: { brands: [netcel] } });
    await render(netcel);
    await focus();
    await type('Operadora inexistente');
    expect(changed).toHaveBeenLastCalledWith(null);
    expect(selection()).toBeNull();
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(0);
    expect(container.textContent).toContain('Nenhuma marca encontrada');
    await blur();
    expect(selection()).toBeNull();
    expect(changed.mock.calls.every(([value]) => value === null)).toBe(true);
    expect(getBrandCatalog).toHaveBeenCalledTimes(1);
});

test('prefixo ambíguo exige escolher uma opção e conserva o ID escolhido', async () => {
    getBrandCatalog.mockResolvedValue({ data: { brands: [netcel, netcom] } });
    await render();
    await focus();
    await type('netc');
    await blur();
    expect(selection()).toBeNull();
    await focus();
    const option = [...container.querySelectorAll('[role="option"]')]
        .find((item) => item.textContent === 'NETCOM#83');
    await act(async () => option.click());
    expect(changed).toHaveBeenLastCalledWith(netcom);
    expect(selection()).toEqual({ id: 83, name: 'NETCOM' });
    expect(input().value).toBe('NETCOM');
});

test('falha permite tentar novamente e desmontagem cancela a consulta pendente', async () => {
    let finishRetry;
    getBrandCatalog.mockRejectedValueOnce(new Error('indisponível'))
        .mockImplementationOnce(() => new Promise((resolve) => { finishRetry = resolve; }));
    await render();
    expect(input().disabled).toBe(true);
    expect(container.textContent).toContain('Não foi possível carregar a lista de marcas.');
    const retry = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Tentar novamente');
    await act(async () => retry.click());
    expect(getBrandCatalog).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain('Buscando marcas cadastradas.');
    const retrySignal = getBrandCatalog.mock.calls[1][0].signal;
    expect(retrySignal.aborted).toBe(false);
    await act(async () => root.unmount());
    root = null;
    expect(retrySignal.aborted).toBe(true);
    await act(async () => finishRetry({ data: { brands: [netcel] } }));
    expect(container.textContent).toBe('');
    expect(changed).not.toHaveBeenCalled();
});
