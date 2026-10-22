import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import StepApp from './StepApp';
import { getAppDescriptionDefaults, INITIAL_FORM } from '../constants';

jest.mock('@chakra-ui/react', () => {
    const React = require('react');
    const View = ({ children }) => <div>{children}</div>;
    return { Box: View, Flex: View, HStack: View, Stack: View, Text: View, SimpleGrid: View, FormControl: View, FormLabel: View,
        Icon: () => null, Badge: View,
        Button: ({ children, onClick, type }) => <button type={type} onClick={onClick}>{children}</button>,
        Switch: ({ 'aria-label': label, isChecked, onChange }) => <input type="checkbox" aria-label={label} checked={isChecked} onChange={onChange} /> };
});
jest.mock('../../../components/Form/TextField', () => ({ __esModule: true, default: ({ label, value, onChange }) => <input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} /> }));
jest.mock('../../../components/Form/ColorField', () => ({ __esModule: true, default: () => <span>Cores</span> }));
jest.mock('../../../components/Form/AppAssetField', () => ({ __esModule: true, default: ({ label, value }) => <output>{label}: {value?.name}</output> }));
jest.mock('../../../components/Preview/BrandPreview', () => ({ __esModule: true, default: () => <span>Prévia completa</span> }));
jest.mock('../../../components/Preview/AppIdentityPreview', () => ({ __esModule: true, default: () => <span>Prévia de contraste</span> }));
jest.mock('../../../hooks/useObjectUrl', () => ({ useObjectUrl: (file) => file ? `blob:${file.name}` : null }));

let root;
let container;
let currentForm;
const initial = { ...INITIAL_FORM, companyName: 'Marca', appName: 'App editado', appLogo: new File(['x'], 'logo.png', { type: 'image/png' }) };
function Harness({ hasApp = true }) {
    const [form, setForm] = useState(initial);
    currentForm = form;
    return <StepApp hasApp={hasApp} form={form} errors={{}} setField={(field, value) => setForm((old) => ({ ...old, [field]: value }))} />;
}
beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT; });
test('Possui aplicativo fica ao lado do título e bloqueia campos e prévias sem perder dados', () => {
    act(() => root.render(<Harness />));
    const toggle = () => container.querySelector('[aria-label="Possui aplicativo?"]');
    expect(toggle()).not.toBeNull();
    expect(toggle().checked).toBe(false);
    expect(container.querySelector('[aria-label="Nome do aplicativo"]')).toBeNull();
    act(() => Simulate.change(toggle(), { target: { checked: true } }));
    const header = toggle().parentElement.parentElement.parentElement;
    expect(header.textContent).toContain('Aplicativo white label');
    act(() => Simulate.change(toggle(), { target: { checked: false } }));
    expect(container.querySelector('[aria-label="Nome do aplicativo"]')).toBeNull();
    expect(container.textContent).not.toContain('Prévia completa');
    expect(container.textContent).not.toContain('Prévia de contraste');
    expect(container.textContent).not.toContain('logo.png');
    expect(currentForm.appEnabled).toBe(false);
    expect(currentForm.appLogo).toBe(initial.appLogo);
    act(() => Simulate.change(toggle(), { target: { checked: true } }));
    expect(container.querySelector('[aria-label="Nome do aplicativo"]').value).toBe('App editado');
    expect(container.textContent).toContain('logo.png');
});
test('descrições ficam vazias até clicar no botão, que preenche ambos os modelos', () => {
    act(() => root.render(<Harness />));
    act(() => Simulate.change(container.querySelector('[aria-label="Possui aplicativo?"]'), { target: { checked: true } }));
    expect(container.querySelector('[aria-label="Descrição curta"]').value).toBe('');
    expect(container.querySelector('[aria-label="Descrição longa"]').value).toBe('');
    const button = [...container.querySelectorAll('button')].find((control) => control.textContent === 'Usar textos padrão');
    act(() => button.click());
    const defaults = getAppDescriptionDefaults('Marca');
    expect(currentForm.appShortDescription).toBe(defaults.appShortDescription);
    expect(currentForm.appLongDescription).toBe(defaults.appLongDescription);
});
test('marca sem App no ERP não recebe controle ou campos de aplicativo', () => {
    act(() => root.render(<Harness hasApp={false} />));
    expect(container.textContent).toBe('');
    expect(container.querySelector('input')).toBeNull();
});
