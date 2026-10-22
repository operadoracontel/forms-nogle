import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import BrandPreview from './BrandPreview';

jest.mock('@chakra-ui/react', () => {
    const React = require('react');
    const View = React.forwardRef(({ children, className, role, 'aria-label': label }, ref) => (
        <div ref={ref} className={className} role={role} aria-label={label}>{children}</div>
    ));
    const Button = ({ children, onClick, type, 'aria-pressed': pressed, 'aria-label': label }) => (
        <button type={type} onClick={onClick} aria-pressed={pressed} aria-label={label}>{children}</button>
    );
    return {
        Box: View, Flex: View, HStack: View, Stack: View, Text: View,
        ModalBody: View, ModalContent: View, ModalHeader: View,
        ModalOverlay: () => null, ModalCloseButton: () => null, Icon: () => null,
        Modal: ({ isOpen, children }) => isOpen ? <div role="dialog">{children}</div> : null,
        Button,
        useColorModeValue: (light) => light,
        useDisclosure: () => {
            const [isOpen, setIsOpen] = React.useState(false);
            return { isOpen, onOpen: () => setIsOpen(true), onClose: () => setIsOpen(false) };
        },
    };
});

jest.mock('./AppPreview', () => ({
    __esModule: true,
    default: ({ corPrimaria, nomeMarca, logoUrl, screen, mobile, contrastColor, preserveLogoColors, splashColor, splashImageUrl }) => (
        <output data-testid="app-preview">{JSON.stringify({ corPrimaria, nomeMarca, logoUrl, screen, mobile, contrastColor, preserveLogoColors, splashColor, splashImageUrl })}</output>
    ),
}));
jest.mock('./VendaPreview', () => ({
    __esModule: true,
    default: ({ corPrimaria, nomeMarca, logoUrl, screen, mobile, onScreenChange }) => (
        <div>
            <output data-testid="vendas-preview">{JSON.stringify({ corPrimaria, nomeMarca, logoUrl, screen, mobile })}</output>
            <button onClick={() => onScreenChange('checkout')}>Comprar no mockup</button>
            <button onClick={() => onScreenChange('confirmacao')}>Finalizar no mockup</button>
        </div>
    ),
}));
jest.mock('./SitePreview', () => ({
    __esModule: true,
    default: ({ corPrimaria, nomeMarca, logoUrl, screen, mobile }) => (
        <output data-testid="site-preview">{JSON.stringify({ corPrimaria, nomeMarca, logoUrl, screen, mobile })}</output>
    ),
}));

jest.mock('./RecargaPreview', () => ({
    __esModule: true,
    default: ({ corPrimaria, nomeMarca, logoUrl, screen, mobile, onScreenChange }) => (
        <div>
            <output data-testid="recarga-preview">{JSON.stringify({ corPrimaria, nomeMarca, logoUrl, screen, mobile })}</output>
            <button type="button" onClick={() => onScreenChange('seguranca')}>Confirmar linha no mockup</button>
        </div>
    ),
}));

let container;
let root;
const render = async (props = {}) => {
    await act(async () => root.render(<BrandPreview {...props} />));
};
const button = (label) => [...container.querySelectorAll('button')].find((item) => item.textContent === label);
const click = async (label) => {
    const control = button(label);
    expect(control).toBeDefined();
    await act(async () => control.click());
};
const preview = (product) => {
    const output = container.querySelector(`[data-testid="${product}-preview"]`);
    return output ? JSON.parse(output.textContent) : null;
};

beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('demonstração oferece os quatro produtos e alterna entre suas prévias', async () => {
    await render({ isDemo: true, hasApp: false, contractedProducts: [] });
    ['Aplicativo', 'Solução de Vendas', 'Site Webpresence', 'Recarga-Fácil'].forEach((label) => expect(button(label)).toBeDefined());
    expect(preview('app')).toMatchObject({ screen: 'login' });
    await click('Solução de Vendas');
    expect(preview('vendas')).toMatchObject({ screen: 'inicio' });
    expect(preview('app')).toBeNull();
    await click('Site Webpresence');
    expect(preview('site')).not.toBeNull();
    expect(preview('vendas')).toBeNull();
    await click('Recarga-Fácil');
    expect(preview('recarga')).toMatchObject({ screen: 'inicio' });
    expect(preview('site')).toBeNull();
});

test('marca real com somente Site Web não oferece App ou Vendas', async () => {
    await render({ contractedProducts: ['Site Web'], hasApp: false });
    expect(preview('site')).not.toBeNull();
    expect(preview('app')).toBeNull();
    expect(preview('vendas')).toBeNull();
    expect(button('Aplicativo')).toBeUndefined();
    expect(button('Solução de Vendas')).toBeUndefined();
    expect(button('Recarga')).toBeUndefined();
    expect(preview('recarga')).toBeNull();
});

test('hasApp controla a disponibilidade do App independentemente da lista de produtos', async () => {
    await render({ contractedProducts: ['Aplicativo Mobile', 'Solucao de Vendas'], hasApp: false });
    expect(preview('vendas')).not.toBeNull();
    expect(button('Aplicativo')).toBeUndefined();
    await render({ contractedProducts: ['Site Web'], hasApp: true });
    expect(button('Aplicativo')).toBeDefined();
    expect(preview('app')).not.toBeNull();
    expect(preview('vendas')).toBeNull();
});

test('variante exclusiva de App exige hasApp e não libera outros produtos', async () => {
    await render({ variant: 'app', isDemo: true, hasApp: false, contractedProducts: ['Site Web', 'Aplicativo Mobile'] });
    expect(container.textContent).toBe('');
    await render({ variant: 'app', hasApp: true, contractedProducts: ['Site Web'] });
    expect(preview('app')).toMatchObject({ screen: 'login' });
    expect(preview('site')).toBeNull();
    expect(button('Site Webpresence')).toBeUndefined();
});

test('controles do App apresentam cada tela correspondente', async () => {
    await render({ hasApp: true });
    for (const [label, screen] of [['Início', 'home'], ['Recarga', 'recarga'], ['Linhas', 'linhas'], ['Menu', 'menu'], ['Entrar', 'login'], ['Perfil', 'perfil'], ['Portabilidade', 'portabilidade'], ['Apresentação', 'thumbnail'], ['Splash', 'splash']]) {
        await click(label);
        expect(preview('app').screen).toBe(screen);
        expect(button(label).getAttribute('aria-pressed')).toBe('true');
    }
});

test('setas percorrem telas, retornam ao início e sincronizam a prévia ampliada', async () => {
    await render({ variant: 'app', hasApp: true });
    expect(preview('app').screen).toBe('login');
    const arrow = (label, scope = container) => scope.querySelector(`button[aria-label="${label}"]`);
    await act(async () => arrow('Tela anterior do aplicativo').click());
    expect(preview('app').screen).toBe('portabilidade');
    await act(async () => arrow('Próxima tela do aplicativo').click());
    expect(preview('app').screen).toBe('login');
    await act(async () => arrow('Próxima tela do aplicativo').click());
    expect(preview('app').screen).toBe('thumbnail');
    await click('Ampliar prévia');
    await act(async () => arrow('Próxima tela do aplicativo', container.querySelector('[role="dialog"]')).click());
    const outputs = [...container.querySelectorAll('[data-testid="app-preview"]')];
    expect(outputs).toHaveLength(2);
    outputs.forEach((output) => expect(JSON.parse(output.textContent).screen).toBe('splash'));
});

test('desativar o App remove sua prévia inclusive na demonstração e reativar restaura Entrar', async () => {
    await render({ isDemo: true, hasApp: true });
    await render({ isDemo: true, hasApp: true, appEnabled: false });
    expect(button('Aplicativo')).toBeUndefined();
    expect(preview('app')).toBeNull();
    expect(preview('vendas')).not.toBeNull();
    await render({ variant: 'app', hasApp: true, appEnabled: false });
    expect(container.textContent).toBe('');
    await render({ variant: 'app', hasApp: true, appEnabled: true });
    expect(preview('app').screen).toBe('login');
});

test('mudança externa que desativa App mantém o foco no controle do formulário', async () => {
    await render({ isDemo: true, hasApp: true });
    const control = document.createElement('input');
    document.body.appendChild(control);
    control.focus();
    const focus = jest.spyOn(HTMLElement.prototype, 'focus');
    try {
        await render({ isDemo: true, hasApp: true, appEnabled: false });
        expect(document.activeElement).toBe(control);
        expect(focus).not.toHaveBeenCalled();
    } finally {
        focus.mockRestore();
        control.remove();
    }
});

test('setas de produtos percorrem somente opções disponíveis e reiniciam a tela', async () => {
    await render({ contractedProducts: ['Solucao de Vendas', 'Link de recarga facil'], hasApp: false });
    const arrow = (label) => container.querySelector(`[aria-label="${label}"]`);
    await click('Configurar plano');
    await act(async () => arrow('Próximo produto').click());
    expect(preview('recarga').screen).toBe('inicio');
    await act(async () => arrow('Próximo produto').click());
    expect(preview('vendas').screen).toBe('inicio');
    await act(async () => arrow('Produto anterior').click());
    expect(preview('recarga').screen).toBe('inicio');
    expect(preview('app')).toBeNull();
    expect(preview('site')).toBeNull();
});

test.each([
    ['Solucao de Vendas', 'Solução de Vendas', 'vendas', 'checkout', 'confirmacao'],
    ['Site Web', 'Site Webpresence', 'site', 'planos', 'faq'],
    ['Link de recarga facil', 'Recarga-Fácil', 'recarga', 'seguranca', 'confirmacao'],
])('setas de telas funcionam em %s, inclusive no modal', async (canonical, label, product, next, last) => {
    await render({ contractedProducts: [canonical] });
    const arrow = (direction, scope = container) => scope.querySelector(`[aria-label="${direction}: ${label}"]`);
    await act(async () => arrow('Tela anterior').click());
    expect(preview(product).screen).toBe(last);
    await act(async () => arrow('Próxima tela').click());
    expect(preview(product).screen).toBe('inicio');
    await click('Ampliar prévia');
    await act(async () => arrow('Próxima tela', container.querySelector('[role="dialog"]')).click());
    [...container.querySelectorAll(`[data-testid="${product}-preview"]`)].forEach((output) => expect(JSON.parse(output.textContent).screen).toBe(next));
});

test('identidade específica do App chega também à prévia ampliada', async () => {
    const identity = { contrastColor: '#ffffff', preserveLogoColors: true, splashColor: '#123456', splashImageUrl: 'blob:splash' };
    await render({ variant: 'app', hasApp: true, ...identity });
    await click('Splash');
    expect(preview('app')).toMatchObject({ ...identity, screen: 'splash' });
    await click('Ampliar prévia');
    const outputs = [...container.querySelectorAll('[data-testid="app-preview"]')];
    expect(outputs).toHaveLength(2);
    outputs.forEach((output) => expect(JSON.parse(output.textContent)).toMatchObject({ ...identity, screen: 'splash' }));
});

test('edições de cor, logo e nome chegam à tela ativa e aos produtos selecionados depois', async () => {
    const products = { hasApp: true, contractedProducts: ['Solucao de Vendas', 'Site Web'] };
    await render({ ...products, primaryColor: '#AbC', logoUrl: 'blob:logo-inicial', brandName: 'Marca inicial' });
    await click('Recarga');
    expect(preview('app')).toMatchObject({ corPrimaria: '#aabbcc', nomeMarca: 'Marca inicial', logoUrl: 'blob:logo-inicial', screen: 'recarga' });
    const updated = { ...products, primaryColor: '#123456', logoUrl: 'blob:logo-novo', brandName: 'Marca atualizada' };
    await render(updated);
    expect(preview('app')).toMatchObject({ corPrimaria: '#123456', nomeMarca: 'Marca atualizada', logoUrl: 'blob:logo-novo', screen: 'recarga' });
    await click('Solução de Vendas');
    await click('Configurar plano');
    expect(preview('vendas')).toMatchObject({ corPrimaria: '#123456', nomeMarca: 'Marca atualizada', logoUrl: 'blob:logo-novo', screen: 'checkout' });
    await click('Site Webpresence');
    await click('Desktop');
    expect(preview('site')).toMatchObject({ corPrimaria: '#123456', nomeMarca: 'Marca atualizada', logoUrl: 'blob:logo-novo', mobile: false });
    await click('Aplicativo');
    expect(preview('app').screen).toBe('login');
});

test('ações internas de Vendas atualizam a tela e seus controles de navegação', async () => {
    await render({ contractedProducts: ['Solucao de Vendas'] });
    expect(preview('vendas').screen).toBe('inicio');
    await click('Comprar no mockup');
    expect(preview('vendas').screen).toBe('checkout');
    expect(button('Configurar plano').getAttribute('aria-pressed')).toBe('true');
    await click('Finalizar no mockup');
    expect(preview('vendas').screen).toBe('confirmacao');
    expect(button('Próximos passos').getAttribute('aria-pressed')).toBe('true');
    await click('Planos');
    expect(preview('vendas').screen).toBe('inicio');
});

test('Recarga-Fácil segue o produto canônico do ERP e conserva a identidade ao navegar', async () => {
    await render({ contractedProducts: ['Link de recarga facil'], hasApp: false, primaryColor: '#123456', brandName: 'Marca ERP', logoUrl: 'blob:marca' });
    expect(preview('recarga')).toMatchObject({ corPrimaria: '#123456', nomeMarca: 'Marca ERP', logoUrl: 'blob:marca', screen: 'inicio', mobile: true });
    expect(preview('site')).toBeNull();
    expect(preview('vendas')).toBeNull();
    expect(preview('app')).toBeNull();
    await click('Confirmar linha no mockup');
    expect(preview('recarga').screen).toBe('seguranca');
    expect(button('Segurança').getAttribute('aria-pressed')).toBe('true');
    await click('Desktop');
    await click('Pagamento');
    expect(preview('recarga')).toMatchObject({ corPrimaria: '#123456', nomeMarca: 'Marca ERP', screen: 'pagamento', mobile: false });
});
