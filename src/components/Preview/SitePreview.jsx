import React, { useEffect, useRef, useState } from 'react';
import { FiArrowRight, FiArrowUpRight, FiCheck, FiHeart, FiMenu, FiMessageCircle, FiPhoneCall, FiPlus, FiShield, FiSmartphone, FiWifi, FiX, FiZap } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import BrowserFrame from './BrowserFrame';
import BrandLogo from './BrandLogo';
import { getContrastColor, normalizeColor } from './previewUtils';
import { PREVIEW_PLANS, PreviewNotice, PreviewTag, money, previewAsset, productStyle } from './CommercePreviewUI';
import './SitePreview.css';

const PLANS = [PREVIEW_PLANS[0], PREVIEW_PLANS[2], PREVIEW_PLANS[4]];
const BENEFITS = [
    [FiMessageCircle, 'WhatsApp liberado', 'Mais espaço para as suas conversas.'],
    [FiShield, 'Planos sem fidelidade', 'Liberdade para escolher sua conexão.'],
    [FiPhoneCall, 'Atendimento que resolve', 'Conte com a equipe da sua marca.'],
    [FiWifi, 'Internet que acompanha você', 'Conecte seus melhores momentos.'],
    [FiZap, 'Conexão 4G e 5G', 'Tecnologia para o seu dia a dia.'],
    [FiSmartphone, 'Experiência digital', 'Gerencie sua linha com praticidade.'],
];
const QUESTIONS = [
    ['Posso manter meu número atual?', 'Sim. No produto publicado, a solicitação de portabilidade orienta sobre os dados e as etapas para trazer seu número.'],
    ['Como escolho entre chip físico e eSIM?', 'O chip físico é inserido no aparelho. O eSIM é digital e depende da compatibilidade do seu dispositivo.'],
    ['Como faço uma recarga?', 'O canal Recarga Fácil reúne a confirmação da linha, os planos disponíveis e as opções de pagamento da marca.'],
    ['Como consulto a cobertura?', 'Consulte o atendimento da marca para verificar disponibilidade, cobertura e condições na sua região.'],
];

/** Estrutura de Webpresence: Hero, Plans, Benefits,
 * Features, AppSection, FAQ e Footer. Imagens locais da própria referência. */
export default function SitePreview({ logoUrl, corPrimaria, nomeMarca = 'Sua marca', mobile = false, screen = 'inicio', onScreenChange }) {
    const [active, setActive] = useState(screen);
    const [menu, setMenu] = useState(false);
    const [question, setQuestion] = useState(null);
    const [notice, setNotice] = useState('');
    const [noticeTop, setNoticeTop] = useState(0);
    const rootRef = useRef(null);
    const sections = useRef({});
    const foreground = getContrastColor(normalizeColor(corPrimaria));
    const inverse = foreground === '#ffffff';
    const featured = PLANS[2];

    const scrollToSection = (id) => {
        const target = sections.current[id];
        const stage = rootRef.current?.closest('.form-brand-preview__stage');
        if (!target || !stage) return;
        if (id === 'inicio') { stage.scrollTo?.({ top: 0, behavior: 'smooth' }); return; }
        stage.scrollTo?.({ top: stage.scrollTop + target.getBoundingClientRect().top - stage.getBoundingClientRect().top - 12, behavior: 'smooth' });
    };
    useEffect(() => {
        setActive(screen);
        const frame = requestAnimationFrame(() => scrollToSection(screen));
        return () => cancelAnimationFrame(frame);
    }, [screen, mobile]);
    const navigate = (id) => { setActive(id); setMenu(false); onScreenChange?.(id); scrollToSection(id); };
    const show = (event, label) => {
        const root = rootRef.current;
        const bounds = root?.getBoundingClientRect();
        const trigger = event.currentTarget.getBoundingClientRect();
        const scale = bounds?.width / root?.clientWidth || 1;
        setNoticeTop(Math.max(12, Math.min((trigger.top - bounds.top + trigger.height) / scale + 12, root.scrollHeight - 190)));
        setNotice(label + ': na versão publicada, este botão abre o canal da ' + nomeMarca + '. Esta prévia é apenas visual.');
    };
    const brand = (onColor = false) => <BrandLogo logoUrl={logoUrl} nomeMarca={nomeMarca} inverse={onColor && inverse} />;

    return <BrowserFrame mobile={mobile} address="www.sua-marca.com.br">
        <div ref={rootRef} className={'commerce-preview site-preview' + (mobile ? ' site-preview--mobile' : '')} style={productStyle(corPrimaria)} aria-label={'Prévia do Site Webpresence ' + nomeMarca}>
            <div className="site-preview-topbar"><button type="button" onClick={(event) => show(event, 'Atendimento')}>Atendimento</button><span>SUA MARCA, MUITO MAIS CONECTADA</span><button type="button" onClick={() => navigate('aplicativo')}>CONHEÇA O APP <FiArrowUpRight /></button></div>
            <header className="site-preview-header">
                <button type="button" className="site-preview-menu-toggle" aria-label={menu ? 'Fechar menu do Webpresence' : 'Abrir menu do Webpresence'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <FiX /> : <FiMenu />}</button>
                <nav aria-label="Menu do Site Webpresence" className={menu ? 'site-preview-nav site-preview-nav--open' : 'site-preview-nav'}>
                    {[['inicio', 'Início'], ['planos', 'Planos'], ['vantagens', 'Vantagens'], ['faq', 'Ajuda']].map(([id, label]) => <button key={id} type="button" aria-current={active === id ? 'page' : undefined} onClick={() => navigate(id)}>{label}</button>)}
                </nav>
                {brand()}
                <button type="button" className="site-preview-header-cta" onClick={() => navigate('planos')}>Comece agora <FiArrowUpRight /></button>
            </header>
            <main>
                <section ref={(el) => { sections.current.inicio = el; }} className="site-preview-hero">
                    <div className="site-preview-hero-copy"><div className="site-preview-hero-icons" aria-hidden="true"><FiSmartphone /><FiHeart /><FiMessageCircle /></div><h1>Você mais<br /><strong>conectado</strong><FiArrowUpRight /></h1><p>A operadora que entende de conectar você com o mundo!</p><button type="button" onClick={() => navigate('aplicativo')}><FiSmartphone /> Comece agora mesmo com o app <FiArrowRight /></button><small>Conheça os planos e benefícios da sua marca.</small></div>
                    <div className="site-preview-hero-image"><div className="site-preview-rings" /><img src={previewAsset('webpresence-hero.png')} alt="Pessoa conectada pelo celular" /><span><FiHeart /></span></div>
                    <div className="site-preview-featured"><span>PLANO EM DESTAQUE</span><strong>{featured.gb}<small>GB</small></strong><p>Internet + SMS + ligações</p><span className="site-preview-featured-divider" /><div><FiMessageCircle /><span>Mais conexão<br />em cada momento</span></div><small>A partir de</small><b>{money(featured.price)}<small>/mês</small></b><button type="button" onClick={() => navigate('planos')}>Quero meu chip <FiArrowUpRight /></button></div>
                </section>
                <section ref={(el) => { sections.current.planos = el; }} className="site-preview-plans-section"><span className="site-preview-tag">Planos e benefícios</span><h2>Muito mais que um plano,<br />possibilidades para fazer mais.</h2><div className="site-preview-plan-grid">{PLANS.map((plan, index) => <article key={plan.gb} className={index === 1 ? 'site-preview-plan site-preview-plan--featured' : 'site-preview-plan'}><span>{index === 1 ? 'MAIS PROCURADO' : 'PLANO MÓVEL'}</span><strong>{plan.gb}<small>GB</small></strong><p>Internet + SMS + ligações</p><ul>{['Conexão 4G e 5G', 'Ligações ilimitadas', 'Chip físico ou eSIM'].map((text) => <li key={text}><FiCheck />{text}</li>)}</ul><div><b>{money(plan.price)}</b><span>/mês</span></div><button type="button" onClick={(event) => show(event, 'Comprar plano de ' + plan.gb + ' GB')}>Comprar agora <FiArrowUpRight /></button></article>)}</div><PreviewTag /></section>
                <section ref={(el) => { sections.current.vantagens = el; }} className="site-preview-benefits"><span className="site-preview-tag">Benefícios</span><h2>Benefícios que já vêm<br /><strong>com seu plano.</strong></h2><div>{BENEFITS.map(([Icon, title, text]) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
                <section className="site-preview-features"><div><span className="site-preview-tag">Pensado para você</span><h2>Cada detalhe,<br />uma nova possibilidade.</h2><div className="site-preview-feature-grid"><article><FiSmartphone /><span>CHIP FÍSICO OU DIGITAL</span><h3>Ative seu chip<br />em minutos.</h3><p>Escolha a tecnologia que combina com o seu aparelho.</p><button type="button" onClick={(event) => show(event, 'Ativação')}>Conhecer <FiArrowUpRight /></button></article><article><FiPhoneCall /><span>PORTABILIDADE</span><h3>Seu número.<br />Uma nova conexão.</h3><p>Traga seu número para a {nomeMarca}.</p><button type="button" onClick={(event) => show(event, 'Portabilidade')}>Quero trazer meu número <FiArrowUpRight /></button></article></div></div><img src={previewAsset('webpresence-person.png')} alt="Pessoa usando o celular" /></section>
                <div className="site-preview-marquee" aria-hidden="true">Você muito mais conectado <FiArrowUpRight /> Você muito mais conectado <FiArrowUpRight /></div>
                <section ref={(el) => { sections.current.aplicativo = el; }} className="site-preview-app-section"><div><span className="site-preview-tag">Na palma da mão</span><h2>Controle tudo<br /><strong>pelo aplicativo.</strong></h2><p>Saldo, recargas, linhas e atendimento.<br />A {nomeMarca} acompanha você.</p><div>{['Saldo', 'Recargas', 'Linhas', 'Pagamentos'].map((text) => <span key={text}><FiCheck />{text}</span>)}</div><button type="button" onClick={(event) => show(event, 'Baixar aplicativo')}>Conheça nosso app <FiArrowRight /></button></div><div className="site-preview-mini-app">{brand()}<span>Minha linha</span><strong>23 GB</strong><small>para aproveitar o seu dia</small><div /><span>Recargas · Planos · Atendimento</span></div></section>
                <section ref={(el) => { sections.current.faq = el; }} className="site-preview-faq"><div><span className="site-preview-tag">Perguntas frequentes</span><h2>Está em dúvida?<br /><strong>Podemos te ajudar.</strong></h2><p>Encontre as respostas para se conectar com tranquilidade.</p></div><div>{QUESTIONS.map(([title, answer], index) => <article key={title}><button type="button" aria-expanded={question === index} onClick={() => setQuestion(question === index ? null : index)}><span>{title}</span>{question === index ? <FiX /> : <FiPlus />}</button>{question === index && <p>{answer}</p>}</article>)}</div></section>
            </main>
            <footer className="site-preview-footer"><div>{brand(true)}<p>Uma operadora feita para<br />simplificar sua vida.</p></div><div><h3>Suporte</h3><button type="button" onClick={(event) => show(event, 'Atendimento')}>Fale com a gente <FiArrowUpRight /></button><button type="button" onClick={() => navigate('faq')}>Central de ajuda <FiArrowUpRight /></button><button type="button" onClick={(event) => show(event, 'Recarga Fácil')}>Recarga Fácil <FiArrowUpRight /></button></div><div><strong>Seu mundo.<br />Sua conexão.</strong><PreviewTag /></div><small>© {new Date().getFullYear()} {nomeMarca} · Site Webpresence.</small></footer>
            {notice && <div className="site-preview-message" style={{ top: noticeTop }}><PreviewNotice message={notice} onClose={() => setNotice('')} /></div>}
            <button type="button" className="site-preview-whatsapp" aria-label="Visualizar contato pelo WhatsApp" onClick={(event) => show(event, 'WhatsApp')}><FaWhatsapp /></button>
        </div>
    </BrowserFrame>;
}
