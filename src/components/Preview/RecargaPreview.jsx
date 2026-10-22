import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle, FiLock, FiShield } from 'react-icons/fi';
import BrowserFrame from './BrowserFrame';
import BrandLogo from './BrandLogo';
import { getContrastColor, normalizeColor } from './previewUtils';
import { PREVIEW_PLANS, PreviewField, PreviewTag, PaymentPreview, PaymentMethods, money, productStyle } from './CommercePreviewUI';
import './RecargaPreview.css';

const LINE = '(11) 99999-9999';
const PLANS = [PREVIEW_PLANS[0], PREVIEW_PLANS[2], PREVIEW_PLANS[4]];

/** Referência: Recarga Fácil; origem em docs/09-previas-e-referencias.md.
 * Somente apresentação: linha, SMS, planos e pagamento são exemplos locais. */
export default function RecargaPreview({ logoUrl, corPrimaria, nomeMarca = 'Sua marca', screen = 'inicio', mobile = false, onScreenChange }) {
    const [activeScreen, setActiveScreen] = useState(screen);
    const [plan, setPlan] = useState(PLANS[1]);
    const [method, setMethod] = useState('pix');
    useEffect(() => { setActiveScreen(screen); }, [screen]);
    const navigate = (next) => { setActiveScreen(next); onScreenChange?.(next); };
    const foreground = getContrastColor(normalizeColor(corPrimaria));
    const isHome = ['inicio', 'seguranca'].includes(activeScreen);

    return <BrowserFrame mobile={mobile} address="recarga.sua-marca.com.br">
        <div className={`commerce-preview recarga-preview ${mobile ? 'recarga-preview--mobile' : ''}`} style={productStyle(corPrimaria)} aria-label={`Prévia do Recarga-Fácil ${nomeMarca}`}>
            <header className="recarga-preview-header">
                <BrandLogo logoUrl={logoUrl} nomeMarca={nomeMarca} inverse={foreground === '#ffffff'} />
                {!isHome && <button type="button" onClick={() => navigate('inicio')}><FiArrowLeft /> Alterar número</button>}
            </header>
            <main className={`recarga-preview-main ${isHome ? 'recarga-preview-main--center' : ''}`}>
                {isHome ? <section className="recarga-preview-validation">
                    <h2>{activeScreen === 'inicio' ? 'Recarga Fácil' : 'Segurança'}</h2>
                    <p>{activeScreen === 'inicio' ? 'Informe o número que deseja recarregar' : `Confirme o acesso à linha ${LINE}`}</p>
                    {activeScreen === 'inicio' ? <PreviewField label="Número do celular" value={LINE} /> : <>
                        <span className="recarga-preview-code-label">Código SMS</span>
                        <div className="recarga-preview-code" aria-label="Código SMS de seis posições">{Array.from({ length: 6 }, (_, index) => <span key={index}>•</span>)}</div>
                        <small>Prévia da verificação de acesso à linha.</small>
                    </>}
                    <button type="button" className="commerce-primary-button" onClick={() => navigate(activeScreen === 'inicio' ? 'seguranca' : 'planos')}>
                        {activeScreen === 'inicio' ? 'Confirmar linha' : 'Validar acesso'} <FiArrowRight />
                    </button>
                </section> : activeScreen === 'planos' ? <>
                    <div className="recarga-preview-title"><span>Linha selecionada · {LINE}</span><h2>Escolha o plano ideal</h2><p>Renove sua conexão com a {nomeMarca}.</p></div>
                    <div className="recarga-preview-plans">{PLANS.map((item, index) => <article key={item.gb} className={index === 1 ? 'recarga-preview-plan recarga-preview-plan--featured' : 'recarga-preview-plan'}>
                        <div className="recarga-preview-plan-heading"><div><small>PLANO</small><h3>{item.gb} GB</h3></div><span>4G/5G</span></div>
                        <div className="recarga-preview-price"><small>R$</small><strong>{Math.trunc(item.price)}</strong><span>,90<small>/mês</small></span></div>
                        <p>Internet para acompanhar o seu dia.</p>
                        <ul>{['Ligações ilimitadas', 'SMS inclusos', 'Validade de 30 dias'].map((benefit) => <li key={benefit}><FiCheck />{benefit}</li>)}</ul>
                        <button type="button" className="commerce-primary-button" aria-label={`Selecionar plano de ${item.gb} GB`} onClick={() => { setPlan(item); navigate('pagamento'); }}>Selecionar plano <FiArrowRight /></button>
                    </article>)}</div>
                    <small className="recarga-preview-plan-note">Prévia dos planos e benefícios.</small>
                </> : activeScreen === 'confirmacao' ? <section className="recarga-preview-success">
                    <FiCheckCircle /><span>PRÉVIA DA CONFIRMAÇÃO</span><h2>Pronto para se conectar!</h2><p>Assim fica a confirmação da sua recarga.</p>
                    <div><span>{LINE}</span><strong>{plan.gb} GB · {money(plan.price)}</strong></div>
                    <small>Confira a apresentação da confirmação de recarga.</small>
                    <button type="button" className="commerce-primary-button" onClick={() => navigate('inicio')}>Voltar ao início <FiArrowRight /></button>
                </section> : <div className="recarga-preview-checkout">
                    <aside className="recarga-preview-summary"><span>CONFIRA SUA RECARGA</span><h2>Resumo do pedido</h2><p>Confira os dados da sua recarga.</p>
                        <dl><div><dt>Linha</dt><dd>{LINE}</dd></div><div><dt>Plano selecionado</dt><dd>{plan.gb} GB</dd></div><div><dt>Valor</dt><dd>{money(plan.price)}</dd></div></dl>
                        <span className="recarga-preview-summary-shield"><FiShield /> Conexão com a {nomeMarca}</span>
                    </aside>
                    <section className="recarga-preview-payment"><h2>Como você deseja pagar?</h2><p>Escolha uma forma de pagamento para visualizar.</p>
                        <PaymentMethods value={method} onChange={setMethod} />
                        <PaymentPreview method={method} plan={plan} onComplete={() => navigate('confirmacao')} />
                    </section>
                </div>}
            </main>
            <footer className="recarga-preview-footer"><span>© {new Date().getFullYear()} {nomeMarca}</span><PreviewTag /><span><FiLock /> Ambiente seguro</span></footer>
        </div>
    </BrowserFrame>;
}
