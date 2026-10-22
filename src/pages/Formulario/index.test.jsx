import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { useParams } from 'react-router-dom';
import { getBrandForm, submitBrandForm } from '../../services/api';
import FormularioPage from './index';

jest.mock('react-router-dom', () => ({ useParams: jest.fn() }));
jest.mock('../../services/api', () => ({ getBrandForm: jest.fn(), submitBrandForm: jest.fn(), extractErrors: () => ['Falha no envio'], extractReason: (error) => error?.response?.data?.reason }));
jest.mock('@chakra-ui/react', () => {
    const React = require('react');
    const View = ({ children }) => <div>{children}</div>;
    return { Alert: View, AlertIcon: () => null, Box: View, Center: View, Flex: View, HStack: View, SimpleGrid: View, Progress: () => null, Spinner: () => <span>Carregando</span>, Stack: View, Text: View, UnorderedList: View, ListItem: View,
        Button: ({ children, onClick, isDisabled, isLoading }) => <button onClick={onClick} disabled={isDisabled || isLoading}>{children}</button>, useToast: () => jest.fn() };
});
jest.mock('../../components/Layout/PageShell', () => ({ __esModule: true, default: ({ children }) => <main>{children}</main> }));
jest.mock('../Status/LinkInvalido', () => ({ __esModule: true, default: () => <span>Link inválido</span> }));
jest.mock('../Status/LinkExpirado', () => ({ __esModule: true, default: () => <span>Link expirado</span> }));
jest.mock('../Status/JaEnviado', () => ({ __esModule: true, default: () => <span>Já enviado</span> }));
jest.mock('../Status/Sucesso', () => ({ __esModule: true, default: () => <span>Sucesso</span> }));
jest.mock('./steps/StepBasico', () => ({ __esModule: true, default: ({ form, setField, setBrand }) => <div>
    <input aria-label="Nome da marca" value={form.companyName} onChange={(event) => { setBrand(null); setField('companyName', event.target.value); }} />
    <input aria-label="Contato" value={form.contactWhatsapp} onChange={(event) => setField('contactWhatsapp', event.target.value)} />
    <input aria-label="0800" value={form.phone0800} onChange={(event) => setField('phone0800', event.target.value)} />
    <input aria-label="WhatsApp da marca" value={form.brandWhatsapp} onChange={(event) => setField('brandWhatsapp', event.target.value)} />
    <button onClick={() => setBrand({ id: 2, name: 'Outra marca' })}>Selecionar outra marca</button>
    <button onClick={() => setBrand({ id: 1, name: 'Marca de teste' })}>Selecionar marca existente</button>
</div> }));
jest.mock('../../components/Form/SectionCard', () => ({ __esModule: true, default: ({ title, children }) => <section><h2>{title}</h2>{children}</section> }));
jest.mock('../../components/Form/ColorField', () => ({ __esModule: true, default: ({ label, value, onChange }) => <input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} /> }));
jest.mock('../../components/Form/FileField', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/Preview/BrandPreview', () => ({ __esModule: true, default: () => <span>Veja sua marca nas soluções</span> }));
jest.mock('./steps/StepDominio', () => ({ __esModule: true, default: () => <span>Etapa domínio</span> }));
jest.mock('./steps/StepApp', () => ({ __esModule: true, default: ({ form, setField }) => <div>
    <span>Etapa exclusiva App</span>
    <input type="checkbox" aria-label="Possui aplicativo?" checked={form.appEnabled !== false} onChange={(event) => setField('appEnabled', event.target.checked)} />
    {form.appEnabled !== false && <>
    <input aria-label="Nome do aplicativo" value={form.appName} onChange={(event) => setField('appName', event.target.value)} />
    <input aria-label="Endereço do aplicativo" value={form.appAddress} onChange={(event) => setField('appAddress', event.target.value)} />
    <input aria-label="Cor do aplicativo" value={form.appColorOne} onChange={(event) => setField('appColorOne', event.target.value)} />
    <textarea aria-label="Descrição curta" value={form.appShortDescription} onChange={(event) => setField('appShortDescription', event.target.value)} />
    <textarea aria-label="Descrição longa" value={form.appLongDescription} onChange={(event) => setField('appLongDescription', event.target.value)} />
    </>}
</div> }));

const metadata = (hasApp = false, brandName = 'Marca de teste') => ({ brandId: 1, brandName, expiresAt: null, productsSource: 'erp', hasApp, contractedProducts: hasApp ? ['Aplicativo Mobile'] : ['Site Web'], submissionAvailable: false });
let container;
let root;
const render = async (token = 'token-a') => {
    useParams.mockReturnValue({ token });
    await act(async () => root.render(<FormularioPage />));
};
const click = async (label) => {
    const button = [...container.querySelectorAll('button')].find((item) => item.textContent === label);
    await act(async () => button.click());
    return button;
};
const contact = () => act(() => Simulate.change(container.querySelector('[aria-label="Contato"]'), { target: { value: '51999999999' } }));

test('contatos extras validam na primeira tela e conservam os valores ao voltar', async () => {
    getBrandForm.mockResolvedValue({ data: metadata() });
    await render();
    contact();
    const change = (label, value) => act(() => Simulate.change(container.querySelector(`[aria-label="${label}"]`), { target: { value } }));
    change('0800', '0800');
    change('WhatsApp da marca', '51');
    await click('Continuar');
    expect(container.textContent).toContain('Etapa 1 de 3');
    expect(container.textContent).toContain('Faltam 2 campos');
    change('0800', '08001234567');
    change('WhatsApp da marca', '51988888888');
    await click('Continuar');
    expect(container.textContent).toContain('Identidade visual da marca');
    await click('Voltar');
    expect(container.querySelector('[aria-label="0800"]').value).toBe('08001234567');
    expect(container.querySelector('[aria-label="WhatsApp da marca"]').value).toBe('51988888888');
    expect(submitBrandForm).not.toHaveBeenCalled();
});

beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    window.scrollTo = jest.fn();
    getBrandForm.mockReset();
    submitBrandForm.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});
afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('hasApp=false oferece três etapas, sem App, e envio indisponível nunca chama POST', async () => {
    getBrandForm.mockResolvedValue({ data: metadata(false) });
    await render();
    expect(container.textContent).toContain('Etapa 1 de 3');
    contact();
    await click('Continuar');
    expect(container.textContent).not.toContain('Etapa exclusiva App');
    await click('Continuar');
    expect(container.textContent).toContain('Etapa domínio');
    const button = await click('Enviar formulário');
    expect(button.disabled).toBe(true);
    expect(submitBrandForm).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain('Sucesso');
});

test('App fica após as soluções na Identidade e valida antes de avançar para Domínio', async () => {
    getBrandForm.mockResolvedValue({ data: metadata(true) });
    await render();
    expect(container.textContent).toContain('Etapa 1 de 3');
    contact();
    await click('Continuar');
    expect(container.textContent).toContain('Etapa exclusiva App');
    expect(container.textContent.indexOf('Veja sua marca nas soluções')).toBeLessThan(container.textContent.indexOf('Etapa exclusiva App'));
    expect(container.querySelector('[aria-label="Possui aplicativo?"]').checked).toBe(false);
    act(() => Simulate.change(container.querySelector('[aria-label="Possui aplicativo?"]'), { target: { checked: true } }));
    expect(container.querySelector('[aria-label="Descrição curta"]').value).toBe('');
    expect(container.querySelector('[aria-label="Descrição longa"]').value).toBe('');
    await click('Continuar');
    expect(container.textContent).toContain('Etapa 2 de 3');
    expect(container.textContent).toContain('Faltam 5 campos');
    const change = (label, value) => act(() => Simulate.change(container.querySelector(`[aria-label="${label}"]`), { target: { value } }));
    change('Nome do aplicativo', 'Minha marca');
    change('Endereço do aplicativo', 'Rua de teste, 123');
    change('Cor do aplicativo', '#123456');
    change('Descrição curta', 'Minha descrição curta');
    change('Descrição longa', 'Minha descrição longa');
    await click('Continuar');
    expect(container.textContent).toContain('Etapa 3 de 3');
    expect(container.textContent).toContain('Etapa domínio');
    expect(container.textContent).not.toContain('Etapa exclusiva App');
});

test('trocar marca não preenche descrições e preserva texto editado pelo cliente', async () => {
    await render('demo');
    contact();
    await click('Selecionar marca existente');
    await click('Continuar');
    act(() => Simulate.change(container.querySelector('[aria-label="Possui aplicativo?"]'), { target: { checked: true } }));
    expect(container.querySelector('[aria-label="Descrição curta"]').value).toBe('');
    act(() => Simulate.change(container.querySelector('[aria-label="Descrição curta"]'), { target: { value: 'Descrição escrita pelo cliente.' } }));
    await click('Voltar');
    // O autocomplete limpa a seleção enquanto a nova busca é digitada.
    act(() => Simulate.change(container.querySelector('[aria-label="Nome da marca"]'), { target: { value: 'Outra' } }));
    await click('Selecionar outra marca');
    await click('Continuar');
    expect(container.querySelector('[aria-label="Descrição curta"]').value).toBe('Descrição escrita pelo cliente.');
    expect(container.querySelector('[aria-label="Descrição longa"]').value).toBe('');
    expect(container.querySelector('[aria-label="Descrição longa"]').value).not.toContain('[Nome da sua Marca]');
});

test('desativar App limpa suas pendências e permite avançar sem os campos bloqueados', async () => {
    getBrandForm.mockResolvedValue({ data: metadata(true) });
    await render();
    contact();
    await click('Continuar');
    act(() => Simulate.change(container.querySelector('[aria-label="Possui aplicativo?"]'), { target: { checked: true } }));
    await click('Continuar');
    expect(container.textContent).toContain('Faltam 5 campos');
    act(() => Simulate.change(container.querySelector('[aria-label="Possui aplicativo?"]'), { target: { checked: false } }));
    expect(container.textContent).not.toContain('Faltam 5 campos');
    await click('Continuar');
    expect(container.textContent).toContain('Etapa 3 de 3');
    await click('Voltar');
    expect(container.querySelector('[aria-label="Possui aplicativo?"]').checked).toBe(false);
    expect(container.querySelector('[aria-label="Nome do aplicativo"]')).toBeNull();
    expect(submitBrandForm).not.toHaveBeenCalled();
});

test('marca diferente do vínculo ou nome livre bloqueiam avanço; selecionar a marca correta libera', async () => {
    getBrandForm.mockResolvedValue({ data: metadata() });
    await render();
    contact();
    await click('Selecionar outra marca');
    await click('Continuar');
    expect(container.textContent).toContain('Etapa 1 de 3');
    expect(container.textContent).not.toContain('Identidade visual da marca');
    act(() => Simulate.change(container.querySelector('[aria-label="Nome da marca"]'), { target: { value: 'Nome não cadastrado' } }));
    await click('Continuar');
    expect(container.textContent).toContain('Etapa 1 de 3');
    expect(submitBrandForm).not.toHaveBeenCalled();
    await click('Selecionar marca existente');
    await click('Continuar');
    expect(container.textContent).toContain('Identidade visual da marca');
});

test('demo permite selecionar marca existente sem vínculo e permanece sem envio', async () => {
    await render('demo');
    contact();
    await click('Continuar');
    expect(container.textContent).toContain('Etapa 1 de 3');
    await click('Selecionar outra marca');
    await click('Continuar');
    expect(container.textContent).toContain('Identidade visual da marca');
    expect(getBrandForm).not.toHaveBeenCalled();
    expect(submitBrandForm).not.toHaveBeenCalled();
});

test('contexto antigo sem ID não permite vincular uma marca escolhida no catálogo', async () => {
    const legacy = { ...metadata() };
    delete legacy.brandId;
    getBrandForm.mockResolvedValue({ data: legacy });
    await render();
    contact();
    await click('Selecionar marca existente');
    await click('Continuar');
    expect(container.textContent).toContain('Etapa 1 de 3');
    expect(container.textContent).not.toContain('Identidade visual da marca');
    expect(submitBrandForm).not.toHaveBeenCalled();
});

test('metadata legado ambíguo permanece indisponível, sem abrir dados fictícios', async () => {
    getBrandForm.mockResolvedValue({ data: { brandName: 'Marca', expiresAt: null, products: ['Aplicativo Mobile'] } });
    await render();
    expect(container.textContent).toContain('Formulário indisponível');
    expect(container.querySelector('input')).toBeNull();
    expect(container.textContent).not.toContain('Nogle Tech');
});

test('503 permite retry e 404 sem reason não é tratado como link inválido', async () => {
    getBrandForm.mockRejectedValueOnce({ response: { status: 503, data: { reason: 'FORMULARIO_INDISPONIVEL' } } }).mockResolvedValueOnce({ data: metadata() });
    await render();
    expect(container.textContent).toContain('Formulário indisponível');
    await click('Tentar novamente');
    expect(container.textContent).toContain('Marca de teste');
    getBrandForm.mockRejectedValueOnce({ response: { status: 404, data: {} } });
    await render('token-b');
    expect(container.textContent).toContain('Formulário indisponível');
    expect(container.textContent).not.toContain('Link inválido');
});

test('motivos explícitos de link bloqueado preservam a tela correta', async () => {
    getBrandForm.mockRejectedValue({ response: { status: 410, data: { reason: 'EXPIRED' } } });
    await render();
    expect(container.textContent).toContain('Link expirado');
});

test('trocar token cancela consulta e ignora resposta antiga', async () => {
    let resolveA;
    getBrandForm.mockImplementationOnce(() => new Promise((resolve) => { resolveA = resolve; })).mockResolvedValueOnce({ data: metadata(false, 'Marca B') });
    await render('token-a');
    const previousSignal = getBrandForm.mock.calls[0][1].signal;
    await render('token-b');
    expect(previousSignal.aborted).toBe(true);
    await act(async () => resolveA({ data: metadata(true, 'Marca A') }));
    expect(container.querySelector('[aria-label="Nome da marca"]').value).toBe('Marca B');
    expect(container.textContent).toContain('Etapa 1 de 3');
    contact();
    getBrandForm.mockResolvedValueOnce({ data: metadata(false, 'Marca C') });
    await render('token-c');
    expect(container.querySelector('[aria-label="Contato"]').value).toBe('');
});

test('somente /demo abre demonstração; ausência de token não chama API nem simula sucesso', async () => {
    await render('demo');
    expect(getBrandForm).not.toHaveBeenCalled();
    expect(container.textContent).not.toMatch(/Demonstração|As informações não serão enviadas/);
    expect(container.textContent).toContain('Etapa 1 de 3');
    await render(null);
    expect(container.textContent).toContain('Link inválido');
    expect(getBrandForm).not.toHaveBeenCalled();
    expect(submitBrandForm).not.toHaveBeenCalled();
});
