import React, { useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle, FiGift, FiMapPin, FiMessageCircle, FiPhoneCall, FiShield, FiSmartphone, FiWifi, FiZap } from 'react-icons/fi';
import BrowserFrame from './BrowserFrame';
import BrandLogo from './BrandLogo';
import { getContrastColor, normalizeColor } from './previewUtils';
import { PREVIEW_PLANS, PreviewField, PreviewNotice, PreviewTag, PaymentPreview, PaymentMethods, money, previewAsset, productStyle } from './CommercePreviewUI';
import './VendaPreview.css';

const STEPS = ['Seu plano', 'Informações', 'Endereço', 'Método de pagamento', 'Pagamento'];
const Toggle = ({ checked, onChange }) => <button type="button" className="venda-preview-toggle" role="switch" aria-checked={checked} aria-label="Trazer meu número atual" onClick={() => onChange(!checked)}><span /></button>;

/** Layout e fluxo de Venda Direta; origem em docs/09-previas-e-referencias.md.
 * Não importa providers, APIs, dados pessoais ou checkout real. */
export default function VendaPreview({ logoUrl, corPrimaria, nomeMarca = 'Sua marca', screen = 'inicio', mobile = false, onScreenChange }) {
    const [activeScreen, setActiveScreen] = useState(screen);
    const [plan, setPlan] = useState(PREVIEW_PLANS[2]);
    const [portability, setPortability] = useState(true);
    const [chip, setChip] = useState('fisico');
    const [step, setStep] = useState(0);
    const [period, setPeriod] = useState('mensal');
    const [method, setMethod] = useState('pix');
    const [notice, setNotice] = useState('');
    const requestedScreen = useRef(null);
    useEffect(() => {
        setActiveScreen(screen);
        if (requestedScreen.current === screen) { requestedScreen.current = null; return; }
        if (screen === 'checkout') setStep(0);
        if (screen === 'pagamento') setStep(3);
    }, [screen]);
    const navigate = (next) => { requestedScreen.current = next; setNotice(''); setActiveScreen(next); onScreenChange?.(next); };
    const foreground = getContrastColor(normalizeColor(corPrimaria));
    const totalGB = plan.gb + (portability ? 5 : 0);
    const monthlyPrice = period === 'anual' ? plan.price * 8 / 12 : plan.price;
    const chipPrice = chip === 'fisico' ? 15.9 : 0;
    const firstPayment = monthlyPrice + chipPrice;
    const goToStep = (next) => { if (next > 4) { navigate('confirmacao'); return; } navigate(next >= 3 ? 'pagamento' : 'checkout'); setStep(next); };
    const showNotice = (label) => setNotice(label + ': prévia da funcionalidade.');
    const brand = (inverse = false) => <BrandLogo logoUrl={logoUrl} nomeMarca={nomeMarca} inverse={inverse} />;

    return <BrowserFrame mobile={mobile} address="compreaqui.sua-marca.com.br">
        <div className={'commerce-preview venda-preview' + (mobile ? ' venda-preview--mobile' : '')} style={productStyle(corPrimaria)} aria-label={'Prévia da solução de vendas ' + nomeMarca}>
            {activeScreen === 'inicio' ? <div className="venda-preview-start">
                <section className="venda-preview-presentation">
                    {brand(foreground === '#ffffff')}
                    <h2>Turbine seu celular<br />com a maior<br /><strong>velocidade.</strong></h2>
                    <div className="venda-preview-portrait"><img src={previewAsset('vendas-person.png')} alt="Pessoa usando o celular" /></div>
                    <div className="venda-preview-presentation-features"><span><FiMessageCircle /> Converse mais</span><span><FiWifi /> Conecte-se</span><span><FiPhoneCall /> Fale à vontade</span></div>
                </section>
                <section className="venda-preview-offer">
                    <span className="venda-preview-eyebrow">SUA PRÓXIMA CONEXÃO</span><h2>Escolha seu plano</h2><p>Você decide quanto de internet precisa.</p>
                    <div className="venda-preview-plans" role="group" aria-label="Franquia do plano">{PREVIEW_PLANS.map((item) => <button type="button" key={item.gb} aria-pressed={plan.gb === item.gb} onClick={() => setPlan(item)}><strong>{item.gb}</strong><span>GB</span></button>)}</div>
                    <div className="venda-preview-data"><strong>{totalGB}<span>GB</span></strong><p>de internet<br /><small>{plan.gb} GB de plano{portability ? ' + 5 GB de portabilidade' : ''}</small></p></div>
                    {portability && <div className="venda-preview-bonus"><FiGift /><div><strong>Portabilidade ativada</strong><span>Mais internet pelo mesmo valor</span></div><b>+5 GB</b></div>}
                    <div className="venda-preview-benefits"><span><FiMessageCircle /> WhatsApp liberado</span><span><FiPhoneCall /> Ligações ilimitadas</span><span><FiWifi /> Rede 5G</span><span><FiShield /> Cobertura nacional</span></div>
                    <div className="venda-preview-portability"><Toggle checked={portability} onChange={setPortability} /><div><strong>Trazer meu número de outra operadora</strong><small>Continue com o número que você já usa.</small></div></div>
                    <div className="venda-preview-periods">{['mensal', 'anual'].map((item) => <button type="button" key={item} onClick={() => { setPeriod(item); setStep(0); navigate('checkout'); }}>
                        <div><strong>{item === 'mensal' ? 'Mensal' : 'Anual'}</strong><span>{item === 'mensal' ? 'Renove todo mês sem fidelidade' : 'Pague 8 planos e leve 12'}</span></div>
                        <b>{money(item === 'mensal' ? plan.price : plan.price * 8 / 12)}<small>/mês</small></b><FiArrowRight />
                    </button>)}</div>
                    <PreviewTag />
                </section>
            </div> : activeScreen === 'confirmacao' ? <>
                <header className="venda-preview-header">{brand()}<PreviewTag /></header>
                <div className="venda-preview-confirmation">
                    <section><span className="venda-preview-eyebrow">PRÉVIA DA CONFIRMAÇÃO</span><h2>Bem-vindo à<br /><strong>{nomeMarca}!</strong></h2><p>Seu novo jeito de se conectar começa aqui.</p>
                        <div className="venda-preview-welcome-plan"><strong>{totalGB} GB</strong><span>Seu plano {period} · {money(monthlyPrice)}/mês</span></div>
                        <p className="venda-preview-muted">Visualize a confirmação e os próximos passos do pedido.</p>
                        <button type="button" className="commerce-primary-button" onClick={() => navigate('inicio')}>Explorar os planos <FiArrowRight /></button>
                    </section>
                    <section className="venda-preview-next"><h3>Próximos passos</h3><p>Termine de configurar sua conta aqui.</p>
                        {[['Montar seu plano', 'Plano configurado', FiCheckCircle], [chip === 'fisico' ? 'Retirar chip' : 'Instalar eSIM', 'Confira as orientações de ativação', FiSmartphone], ['Agendar portabilidade', 'Traga seu número para a marca', FiPhoneCall], ['Controle inteligente', 'Mais controle na palma da mão', FiZap]].map(([label, description, Icon], index) => <button type="button" key={label} onClick={() => showNotice(label)}><Icon /><span><strong>{label}</strong><small>{description}</small></span>{index === 0 ? <FiCheck /> : <FiArrowRight />}</button>)}
                    </section>
                </div>
            </> : <>
                <header className="venda-preview-header">{brand()}<button type="button" onClick={() => navigate('inicio')}><FiArrowLeft /> Voltar aos planos</button></header>
                <div className="venda-preview-checkout">
                    <section className="venda-preview-config"><h2>{step >= 3 ? 'Escolha como deseja pagar' : step === 0 ? 'Configure seu plano' : step === 1 ? 'Informações pessoais' : 'Endereço de entrega'}</h2><p>Personalize sua experiência com a {nomeMarca}.</p>
                        <ol className="venda-preview-stepper">{STEPS.map((label, index) => <li key={label}><button type="button" aria-current={step === index ? 'step' : undefined} onClick={() => goToStep(index)}><span>{index < step ? <FiCheck /> : index + 1}</span><small>{label}</small></button></li>)}</ol>
                        {step === 0 ? <>
                            <h3>Ganhe bônus</h3><div className="venda-preview-portability"><Toggle checked={portability} onChange={setPortability} /><div><strong>Portabilidade</strong><small>Use seu número atual e ganhe 5 GB.</small></div></div>
                            <h3>Tecnologia de acesso</h3><p>Como você vai se conectar?</p>
                            <div className="venda-preview-chips" role="radiogroup" aria-label="Tipo de chip">{[['fisico', 'Chip físico', 'Chip para inserir no seu aparelho', 15.9], ['virtual', 'Chip virtual (eSIM)', 'Digital, para aparelhos compatíveis', 0]].map(([id, label, description, price]) => <button type="button" key={id} role="radio" aria-checked={chip === id} onClick={() => setChip(id)}><span>{chip === id && <FiCheck />}</span><div><strong>{label}</strong><small>{description}</small></div><b>{money(price)}</b></button>)}</div>
                        </> : step === 1 ? <div className="commerce-fields"><PreviewField label="Nome completo" value="Nome do cliente" wide /><PreviewField label="CPF" value="•••.•••.•••-••" /><PreviewField label="Data de nascimento" value="DD/MM/AAAA" /><PreviewField label="E-mail" value="cliente@seu-dominio.com.br" wide /><PreviewField label="Telefone" value="(11) 99999-9999" wide /></div>
                            : step === 2 ? <><div className="venda-preview-address-icon"><FiMapPin /> Endereço para recebimento do chip</div><div className="commerce-fields"><PreviewField label="CEP" value="00000-000" /><PreviewField label="Número" value="123" /><PreviewField label="Endereço" value="Endereço do cliente" wide /><PreviewField label="Bairro" value="Centro" /><PreviewField label="Cidade / UF" value="Cidade / UF" /></div></>
                                : step === 3 ? <><PaymentMethods value={method} onChange={setMethod} /><p className="venda-preview-payment-hint">{method === 'pix' ? 'PIX: confirmação e orientações no mesmo lugar.' : method === 'cartao' ? 'Cartão: dados organizados em uma etapa simples.' : 'Boleto: visualização do documento de pagamento.'}</p></>
                                    : <PaymentPreview method={method} plan={{ ...plan, price: firstPayment }} onComplete={() => navigate('confirmacao')} />}
                        <div className="venda-preview-config-note"><PreviewTag /><span>Confira a organização dos campos do pedido.</span></div>
                    </section>
                    <aside className="venda-preview-summary"><span className="venda-preview-eyebrow">SEU PLANO, DO SEU JEITO</span><h3>Resumo do pedido</h3><p>Tudo o que está incluso na sua escolha.</p>
                        <div className="venda-preview-summary-plan"><strong>{totalGB}<span>GB</span></strong><div><b>Plano {period}</b><span>{plan.gb} GB{portability ? ' + 5 GB de bônus' : ''}</span></div></div>
                        <dl><div><dt>Plano {period}</dt><dd>{money(monthlyPrice)}</dd></div><div><dt>{chip === 'fisico' ? 'Chip físico' : 'Chip virtual'}</dt><dd>{money(chipPrice)}</dd></div><div><dt>Primeiro pagamento</dt><dd>{money(firstPayment)}</dd></div></dl>
                        {step < 4 && <button type="button" className="commerce-primary-button" onClick={() => goToStep(step + 1)}>Continuar <FiArrowRight /></button>}
                        <small>Prévia do resumo do pedido.</small>
                    </aside>
                </div>
            </>}
            <footer className="venda-preview-footer"><strong>#{nomeMarca.split(' ').join('')}</strong><div>{['Sobre', 'Tire suas dúvidas', 'LGPD', 'Fale conosco'].map((label) => <button key={label} type="button" onClick={() => showNotice(label)}>{label}</button>)}</div><span>© {new Date().getFullYear()} {nomeMarca}</span></footer>
            <PreviewNotice message={notice} onClose={() => setNotice('')} />
        </div>
    </BrowserFrame>;
}
