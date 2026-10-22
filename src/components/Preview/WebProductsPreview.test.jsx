import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RecargaPreview from './RecargaPreview';
import VendaPreview from './VendaPreview';
import SitePreview from './SitePreview';

let container;
let root;
let openRequest;
let previousFetch;
const render = async (element) => { await act(async () => root.render(element)); };
const clickElement = async (element) => { expect(element).toBeTruthy(); await act(async () => element.click()); };
const button = (text) => [...container.querySelectorAll('button')].find((item) =>
    text instanceof RegExp ? text.test(item.textContent.trim()) : item.textContent.trim() === text);
const click = async (text) => clickElement(button(text));

beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    previousFetch = global.fetch;
    global.fetch = jest.fn();
    openRequest = jest.spyOn(XMLHttpRequest.prototype, 'open').mockImplementation(() => {});
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});
afterEach(() => {
    expect(global.fetch).not.toHaveBeenCalled();
    expect(openRequest).not.toHaveBeenCalled();
    expect([...container.querySelectorAll('button')].every((item) => item.type === 'button')).toBe(true);
    act(() => root.unmount());
    container.remove();
    openRequest.mockRestore();
    global.fetch = previousFetch;
    delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('Recarga percorre linha, segurança, plano e conclusão sem SMS, pagamento ou dados reais', async () => {
    const navigate = jest.fn();
    await render(<RecargaPreview nomeMarca="Marca Exemplo" corPrimaria="#eabb00" onScreenChange={navigate} />);
    expect(container.textContent).toContain('Recarga Fácil');
    await click('Confirmar linha');
    expect(container.textContent).toContain('Prévia da verificação de acesso à linha');
    await click('Validar acesso');
    await clickElement(container.querySelector('[aria-label="Selecionar plano de 45 GB"]'));
    expect(container.textContent).toContain('45 GB');
    expect(container.textContent).toContain('R$ 59,90');
    await click('Cartão de crédito');
    expect(container.textContent).toContain('Nome no cartão');
    expect(container.querySelector('input')).toBeNull();
    await click('Ver confirmação');
    expect(container.textContent).toContain('Confira a apresentação da confirmação de recarga');
    await click('Voltar ao início');
    expect(navigate.mock.calls.map(([screen]) => screen)).toEqual(['seguranca', 'planos', 'pagamento', 'confirmacao', 'inicio']);
});

test('formas de pagamento da Recarga são locais e não geram QR, boleto ou coleta de cartão', async () => {
    await render(<RecargaPreview screen="pagamento" nomeMarca="Marca Exemplo" />);
    expect(container.textContent).toContain('QR Code');
    await click('Boleto');
    expect(container.textContent).toContain('Boleto bancário');
    expect(container.querySelector('a')).toBeNull();
    await click('Cartão de crédito');
    expect(container.querySelector('input')).toBeNull();
    await click('PIX');
    expect(container.textContent).toContain('Prévia da etapa de pagamento');
});

const ControlledSales = ({ initialScreen = 'inicio' }) => {
    const [screen, setScreen] = useState(initialScreen);
    return <VendaPreview screen={screen} onScreenChange={setScreen} nomeMarca="Marca Exemplo" corPrimaria="#123456" logoUrl="blob:logo" />;
};

test('Vendas mantém plano, bônus e chip ao atravessar os passos com o host controlando a tela', async () => {
    await render(<ControlledSales />);
    await clickElement([...container.querySelectorAll('.venda-preview-plans button')].find((item) => item.textContent === '45GB'));
    expect(container.querySelector('.venda-preview-data').textContent).toContain('50GB');
    await clickElement(container.querySelector('[role="switch"]'));
    expect(container.querySelector('.venda-preview-data').textContent).toContain('45GB');
    await click(/^Mensal/);
    await clickElement(container.querySelector('[role="radio"][aria-checked="false"]'));
    expect(container.querySelector('.venda-preview-summary').textContent).toContain('Chip virtualR$ 0,00');
    await click('Continuar');
    expect(container.querySelector('[aria-current="step"]').textContent).toContain('Informações');
    await click('Continuar');
    expect(container.querySelector('[aria-current="step"]').textContent).toContain('Endereço');
    await click('Continuar');
    await click('Cartão de crédito');
    await click('Continuar');
    expect(container.textContent).toContain('Nome no cartão');
    expect(container.querySelector('input')).toBeNull();
    await click('Ver confirmação');
    expect(container.textContent).toContain('Visualize a confirmação e os próximos passos do pedido');
    expect(container.querySelector('.venda-preview-welcome-plan').textContent).toContain('45 GB');
    expect(container.querySelector('.venda-preview-welcome-plan').textContent).toContain('R$ 59,90');
    await click('Instalar eSIMConfira as orientações de ativação');
    expect(container.querySelector('[role="status"]').textContent).toContain('Instalar eSIM');
});

test('salto direto ao último passo do checkout não volta ao seletor de método', async () => {
    await render(<ControlledSales initialScreen="checkout" />);
    await click('5Pagamento');
    expect(container.querySelector('[aria-current="step"]').textContent).toBe('5Pagamento');
    expect(container.textContent).toContain('QR Code');
});

test('Webpresence usa imagens da cópia local, menu mobile, seções e respostas interativas', async () => {
    const navigate = jest.fn();
    await render(<SitePreview nomeMarca="Marca Exemplo" mobile corPrimaria="#123456" logoUrl="blob:logo" onScreenChange={navigate} />);
    expect(container.textContent).toContain('Você maisconectado');
    expect(container.querySelector('img[src$="webpresence-hero.png"]')).toBeTruthy();
    expect(container.querySelector('img[src="blob:logo"]')).toBeTruthy();
    await clickElement(container.querySelector('[aria-label="Abrir menu do Webpresence"]'));
    expect(container.querySelector('[aria-label="Fechar menu do Webpresence"]').getAttribute('aria-expanded')).toBe('true');
    await click('Planos');
    expect(navigate).toHaveBeenLastCalledWith('planos');
    expect(container.querySelector('[aria-label="Abrir menu do Webpresence"]').getAttribute('aria-expanded')).toBe('false');
    await click('Posso manter meu número atual?');
    expect(container.textContent).toContain('a solicitação de portabilidade orienta');
    await click('Posso manter meu número atual?');
    expect(container.textContent).not.toContain('a solicitação de portabilidade orienta');
    await click('Comprar agora');
    expect(container.querySelector('[role="status"]').textContent).toContain('Marca Exemplo');
    await clickElement(container.querySelector('[aria-label="Fechar aviso da prévia"]'));
    expect(container.querySelector('[role="status"]')).toBeNull();
});
