import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import AppPreview from './AppPreview';

let container;
let root;
let fetchMock;
let originalFetch;
let xhrOpen;

const render = (props = {}) => act(() => root.render(<AppPreview nomeMarca="Marca Exemplo" corPrimaria="#0000ff" {...props} />));
const click = (button) => {
    expect(button).not.toBeNull();
    act(() => button.click());
};
const buttonByText = (text) => [...container.querySelectorAll('button')].find((button) => button.textContent.trim() === text) || null;
const buttonByLabel = (label) => container.querySelector(`button[aria-label="${label}"]`);

beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    originalFetch = global.fetch;
    fetchMock = jest.fn(() => Promise.reject(new Error('A prévia não pode fazer requisições.')));
    global.fetch = fetchMock;
    xhrOpen = jest.spyOn(XMLHttpRequest.prototype, 'open').mockImplementation(() => {
        throw new Error('A prévia não pode abrir uma conexão.');
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
    xhrOpen.mockRestore();
    if (originalFetch === undefined) delete global.fetch;
    else global.fetch = originalFetch;
    delete global.IS_REACT_ACT_ENVIRONMENT;
});

test.each([
    ['login', 'diga olá', '.app-preview-login'],
    ['home', 'Alô, João', '.app-preview-home'],
    ['menu', 'Gerencie sua conta', '.app-preview-menu'],
    ['recarga', 'Escolha seu plano', '.app-preview-recharge'],
    ['linhas', 'Gerencie, solicite e faça portabilidade', '.app-preview-lines-screen'],
])('a tela %s monta seus marcos da referência real dentro do aparelho', (screen, text, selector) => {
    render({ screen });
    expect(container.querySelector(selector)).not.toBeNull();
    expect(container.textContent).toContain(text);
    expect(container.querySelector('.app-preview-phone__content')).not.toBeNull();
    expect(container.querySelector('form, input')).toBeNull();
    expect([...container.querySelectorAll('button')].every((button) => button.type === 'button')).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(xhrOpen).not.toHaveBeenCalled();
});

test('Recarregar na Home navega localmente e informa a tela ao host', () => {
    const onScreenChange = jest.fn();
    render({ screen: 'home', onScreenChange });
    click(buttonByText('Recarregar'));
    expect(container.textContent).toContain('Escolha seu plano');
    expect(container.querySelector('.app-preview-home')).toBeNull();
    expect(onScreenChange).toHaveBeenLastCalledWith('recarga');
});

test('o botão de menu da Home abre a grade real e informa o host', () => {
    const onScreenChange = jest.fn();
    render({ screen: 'home', onScreenChange });
    click(buttonByLabel('Abrir menu do aplicativo'));
    expect(container.textContent).toContain('Gerencie sua conta');
    expect(container.querySelectorAll('.app-preview-menu__grid button')).toHaveLength(9);
    expect(onScreenChange).toHaveBeenLastCalledWith('menu');
});

test('Menu abre uma linha fictícia e Sair retorna à apresentação de login', () => {
    const onScreenChange = jest.fn();
    render({ screen: 'menu', onScreenChange });
    click(buttonByText('Linhas'));
    expect(container.querySelectorAll('.app-preview-lines__card')).toHaveLength(1);
    expect(container.querySelector('.app-preview-lines__card').textContent).toContain('João');
    expect(container.textContent).toContain('LINHA ATIVA');
    expect(onScreenChange).toHaveBeenLastCalledWith('linhas');

    click(buttonByLabel('Voltar ao início'));
    click(buttonByLabel('Abrir menu do aplicativo'));
    click(buttonByText('Sair'));
    expect(container.querySelector('.app-preview-login')).not.toBeNull();
    expect(container.textContent).toContain('Entrar na conta');
    expect(onScreenChange).toHaveBeenLastCalledWith('login');
});

test('a recarga troca 6 por 23 GB e Escolher mostra apenas aviso, sem rede ou pagamento', () => {
    render({ screen: 'recarga' });
    const plans = () => [...container.querySelectorAll('[aria-label="Franquias disponíveis na prévia"] button')];
    expect(plans()).toHaveLength(5);
    expect(plans().find((button) => button.getAttribute('aria-pressed') === 'true').textContent).toBe('06GB');
    click(plans().find((button) => button.textContent === '23GB'));
    expect(plans().find((button) => button.getAttribute('aria-pressed') === 'true').textContent).toBe('23GB');
    expect(container.querySelector('.app-preview-recharge__gauge').textContent).toContain('23 GB');

    click(buttonByText('Escolher'));
    const notice = container.querySelector('[role="status"]');
    expect(notice.textContent).toContain('Plano de 23 GB selecionado na prévia de recarga');
    expect(notice.textContent).toContain('selecionado na prévia de recarga');
    expect(container.querySelector('form, input')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(xhrOpen).not.toHaveBeenCalled();
});

test('editar nome, logo e cor atualiza a marca e mantém contraste na paleta clara', () => {
    render({ screen: 'login', nomeMarca: 'Marca Original', logoUrl: 'blob:logo-original', corPrimaria: '#0000ff' });
    expect(container.querySelector('.preview-brand-logo img').getAttribute('src')).toBe('blob:logo-original');
    expect(container.querySelector('.preview-brand-logo img').alt).toBe('Marca Original');
    expect(container.querySelector('.preview-brand-logo--inverse')).not.toBeNull();

    render({ screen: 'login', nomeMarca: 'Nova Identidade', logoUrl: 'blob:logo-novo', corPrimaria: '#ffffff' });
    const preview = container.querySelector('.app-preview');
    expect(preview.getAttribute('aria-label')).toContain('Nova Identidade');
    expect(container.querySelector('.preview-brand-logo img').getAttribute('src')).toBe('blob:logo-novo');
    expect(container.querySelector('.preview-brand-logo img').alt).toBe('Nova Identidade');
    expect(container.querySelector('.preview-brand-logo--inverse')).toBeNull();
    expect(preview.style.getPropertyValue('--app-preview-primary')).toBe('#ffffff');
    expect(preview.style.getPropertyValue('--app-preview-on-primary')).toBe('#111827');
    expect(preview.style.getPropertyValue('--app-preview-button-ink')).toBe('#111827');
});

test('a identidade do App usa o contraste escolhido sem recolorir o logo enviado', () => {
    render({ screen: 'login', corPrimaria: '#000000', contrastColor: '#ffcc00', logoUrl: 'blob:original', preserveLogoColors: true });
    expect(container.querySelector('.app-preview').style.getPropertyValue('--app-preview-on-primary')).toBe('#ffcc00');
    expect(container.querySelector('.preview-brand-logo img').getAttribute('src')).toBe('blob:original');
    expect(container.querySelector('.preview-brand-logo--inverse')).toBeNull();
});

test('splash usa a cor e o logo originais, ou a imagem personalizada', () => {
    render({ screen: 'splash', corPrimaria: '#123456', splashColor: '#abcdef', logoUrl: 'blob:logo', preserveLogoColors: true });
    expect(container.querySelector('.app-preview-splash').style.background).toBe('rgb(171, 205, 239)');
    expect(container.querySelector('.preview-brand-logo img').getAttribute('src')).toBe('blob:logo');
    expect(container.querySelector('.preview-brand-logo--inverse')).toBeNull();
    render({ screen: 'splash', splashImageUrl: 'blob:splash' });
    expect(container.querySelector('.app-preview-splash img').getAttribute('src')).toBe('blob:splash');
    expect(fetchMock).not.toHaveBeenCalled();
});

test('Entrar abre por padrão e Apresentação usa somente o celular sem marca lateral', () => {
    render();
    expect(container.querySelector('.app-preview-login')).not.toBeNull();
    render({ screen: 'thumbnail', logoUrl: 'blob:logo' });
    expect(container.querySelectorAll('.app-preview-phone')).toHaveLength(1);
    expect(container.querySelector('.app-preview-thumbnail-brand')).toBeNull();
    expect(container.querySelector('.app-preview--screen')).not.toBeNull();
    expect(container.querySelector('.app-preview-home')).not.toBeNull();
});
