import React, { useEffect, useState } from 'react';
import {
    FiArrowLeft, FiArrowRightCircle, FiBarChart2, FiChevronDown,
    FiChevronRight, FiClock, FiCreditCard, FiHelpCircle, FiLogOut, FiMenu,
    FiMessageSquare, FiPhone, FiPlus, FiRepeat, FiSmartphone, FiUser, FiX,
} from 'react-icons/fi';
import PhoneFrame from './PhoneFrame';
import BrandLogo from './BrandLogo';
import { normalizeColor, getContrastColor } from './previewUtils';
import './AppPreview.css';

const PREVIEW_LINE = '(11) 99999-9999';
const PLANS = [6, 10, 15, 23, 45];

const LineHeader = ({ onBack, onLines, onMenu }) => (
    <div className="app-preview-line-header">
        {onBack ? <button type="button" aria-label="Voltar ao início" onClick={onBack}><FiArrowLeft /></button> : <span />}
        <button type="button" className="app-preview-line-pill" onClick={onLines} aria-label="Selecionar linha">{PREVIEW_LINE}<FiChevronDown aria-hidden="true" /></button>
        {onMenu ? <button type="button" aria-label="Abrir menu do aplicativo" onClick={onMenu}><FiMenu /></button> : <span />}
    </div>
);

const ScreenHeader = ({ title, subtitle, onBack }) => (
    <header className="app-preview-screen-header">
        <button type="button" className="app-preview-back" aria-label="Voltar ao menu" onClick={onBack}><FiArrowLeft /></button>
        <h3>{title}</h3>{subtitle && <p>{subtitle}</p>}
    </header>
);

const HomeScreen = ({ nomeMarca, navigate, showNotice }) => (
    <div className="app-preview-home">
        <div className="app-preview-home__main">
            <LineHeader onLines={() => navigate('linhas')} onMenu={() => navigate('menu')} />
            <div className="app-preview-home__greeting">Alô, <span>João</span></div>
            <div className="app-preview-home__balance"><strong>0,00</strong><span>MBs restantes</span></div>
            <p className="app-preview-home__validity">Válido até 18 de maio de 2026</p>
            <button type="button" className="app-preview-home__recharge" onClick={() => navigate('recarga')}><span><FiPlus aria-hidden="true" /></span><strong>Recarregar</strong></button>
        </div>
        <div className="app-preview-home__footer">
            <button type="button" onClick={() => navigate('portabilidade')}><span><small>PORTABILIDADE</small><strong>Número na {nomeMarca}</strong><span>Traga seu número e ganhe bônus</span></span><FiArrowRightCircle aria-hidden="true" /></button>
            <button type="button" onClick={() => showNotice('Prévia do atendimento no aplicativo.')}><span><strong>Precisa de ajuda?</strong><span>Estamos aqui para descomplicar suas dúvidas.</span></span><FiArrowRightCircle aria-hidden="true" /></button>
        </div>
    </div>
);

const LoginScreen = ({ logoUrl, nomeMarca, inverse, showNotice }) => (
    <div className="app-preview-login">
        <div className="app-preview-login__logo"><BrandLogo logoUrl={logoUrl} nomeMarca={nomeMarca} inverse={inverse} /></div>
        <h3>diga olá<br />para sua nova<br />operadora</h3>
        <div className="app-preview-login__actions">
            <button type="button" onClick={() => showNotice('Prévia da criação de conta no aplicativo.')}>Criar Conta</button>
            <button type="button" className="app-preview-white-button" onClick={() => showNotice('Prévia da tela de acesso ao aplicativo.')}>Entrar na conta</button>
            <button type="button" onClick={() => showNotice('Prévia da ativação de chip no aplicativo.')}>Ativar Chip</button>
        </div>
    </div>
);

const MenuScreen = ({ nomeMarca, navigate, showNotice }) => {
    const items = [
        { label: 'Minha Conta', Icon: FiUser, screen: 'perfil' },
        { label: 'Pagamentos', Icon: FiCreditCard },
        { label: 'Linhas', Icon: FiSmartphone, screen: 'linhas' },
        { label: 'Recarga', Icon: FiPlus, screen: 'recarga' },
        { label: 'Histórico', Icon: FiClock },
        { label: 'Portabilidade', Icon: FiRepeat, screen: 'portabilidade' },
        { label: 'Ajuda', Icon: FiHelpCircle },
        { label: 'Ativar Chip', Icon: FiSmartphone },
        { label: 'Sair', Icon: FiLogOut, screen: 'login' },
    ];
    return <div className="app-preview-menu">
        <button type="button" className="app-preview-menu__close" aria-label="Fechar menu do aplicativo" onClick={() => navigate('home')}><FiX /></button>
        <h3>João</h3><p>Gerencie sua conta</p>
        <div className="app-preview-menu__grid">{items.map(({ label, Icon, screen }) => <button type="button" key={label} onClick={() => screen ? navigate(screen) : showNotice(`${label}: prévia da funcionalidade no aplicativo.`)}><Icon aria-hidden="true" /><span>{label}</span></button>)}</div>
        <small className="app-preview-menu__copyright">{new Date().getFullYear()} © {nomeMarca}</small>
    </div>;
};

const RechargeScreen = ({ plan, setPlan, navigate, showNotice }) => (
    <div className="app-preview-recharge">
        <LineHeader onBack={() => navigate('home')} onLines={() => navigate('linhas')} />
        <h3>Escolha seu plano</h3><p className="app-preview-recharge__subtitle">Você decide quanto de<br />internet precisa</p>
        <div className="app-preview-recharge__plans" role="group" aria-label="Franquias disponíveis na prévia">{PLANS.map((value) => <button type="button" key={value} className={value === plan ? 'app-preview-recharge__plan--selected' : ''} aria-pressed={value === plan} onClick={() => setPlan(value)}><strong>{String(value).padStart(2, '0')}</strong><span>GB</span></button>)}</div>
        <div className="app-preview-recharge__gauge"><svg viewBox="0 0 200 110" aria-hidden="true"><path d="M15 100a85 85 0 0 1 170 0" className="app-preview-recharge__track" /><path d="M15 100a85 85 0 0 1 170 0" pathLength="100" strokeDasharray={`${Math.max(12, plan / 45 * 100)} 100`} className="app-preview-recharge__progress" /></svg><strong>{plan} GB</strong></div>
        <div className="app-preview-recharge__benefits">
            <div><span><FiPhone aria-hidden="true" /></span><strong>Ligações</strong><small>ilimitadas</small></div>
            <div><span><FiBarChart2 aria-hidden="true" /></span><strong>Internet</strong><small>{plan === 6 ? <>4 GB + 2 GB de bônus<br />mensal</> : <>{plan} GB de internet<br />no plano</>}</small></div>
            <div><span><FiMessageSquare aria-hidden="true" /></span><strong>60</strong><small>SMS</small></div>
        </div>
        <p className="app-preview-recharge__price">R$ 49,90/mês</p>
        <button type="button" className="app-preview-recharge__coupon" onClick={() => showNotice('Prévia da aplicação de cupom no aplicativo.')}>Adicionar cupom</button>
        <button type="button" className="app-preview-white-button app-preview-recharge__choose" onClick={() => showNotice(`Plano de ${plan} GB selecionado na prévia de recarga.`)}>Escolher</button>
        <small className="app-preview-recharge__legal">Prévia dos planos e benefícios.</small>
    </div>
);

const LinesScreen = ({ navigate, showNotice }) => (
    <div className="app-preview-detail-screen app-preview-lines-screen">
        <LineHeader onBack={() => navigate('home')} onLines={() => showNotice('Linha selecionada na prévia do aplicativo.')} />
        <header className="app-preview-lines__header"><h3>Linhas</h3><p>Gerencie, solicite e faça portabilidade</p></header>
        <div className="app-preview-white-sheet app-preview-lines">
            <button type="button" className="app-preview-lines__card" onClick={() => showNotice('Prévia dos detalhes da linha de João.')}>
                <span className="app-preview-lines__avatar" aria-hidden="true">😀</span>
                <span className="app-preview-lines__information"><strong>João</strong><span>{PREVIEW_LINE}</span></span>
                <span className="app-preview-lines__status">LINHA ATIVA</span><FiArrowRightCircle className="app-preview-lines__arrow" aria-hidden="true" />
            </button>
            <button type="button" className="app-preview-pill" onClick={() => showNotice('Prévia da inclusão de uma nova linha.')}>Nova Linha</button>
        </div>
    </div>
);

// Telas complementares preservadas do Figma White Label – Vox; não existem
// screenshots Netcel fornecidas para confirmar o layout de Perfil/Portabilidade.
const ProfileScreen = ({ navigate, showNotice }) => (
    <div className="app-preview-detail-screen">
        <ScreenHeader title="Perfil" subtitle="Seus dados todos com a gente" onBack={() => navigate('menu')} />
        <div className="app-preview-white-sheet app-preview-profile">{['Dados de acesso', 'Dados pessoais'].map((label) => <button type="button" className="app-preview-profile__card" key={label} onClick={() => showNotice(`${label}: prévia da organização das informações.`)}><FiHelpCircle aria-hidden="true" /><strong>{label}</strong><FiChevronRight aria-hidden="true" /></button>)}</div>
    </div>
);

const PortabilityScreen = ({ navigate, showNotice }) => (
    <div className="app-preview-portability">
        <ScreenHeader title="Portabilidade" subtitle="Qual número você quer trazer?" onBack={() => navigate('menu')} />
        <div className="app-preview-portability__number"><p>Digite o número da portabilidade</p><div className="app-preview-portability__fields"><span>DDD</span><span>Número</span></div><small>Vamos te enviar um sms para confirmar seu número.</small></div>
        <button type="button" className="app-preview-white-button app-preview-portability__continue" onClick={() => showNotice('Prévia da solicitação de portabilidade.')}>Continuar</button>
    </div>
);

/**
 * Base visual: screenshots Netcel de login, início, menu, recarga e linhas.
 * Origem arquivada em docs/09-previas-e-referencias.md. Só o layout é reproduzido;
 * marca, logo e cor vêm das props e todos os dados/ações são demonstrativos.
 */
const AppPreview = ({ logoUrl, corPrimaria, contrastColor, preserveLogoColors = false, splashColor, splashImageUrl, nomeMarca = 'Sua marca', screen = 'login', onScreenChange }) => {
    const primary = normalizeColor(corPrimaria);
    const automaticContrast = getContrastColor(primary);
    const foreground = normalizeColor(contrastColor, automaticContrast);
    const ink = automaticContrast === '#ffffff' ? primary : '#111827';
    const inverseLogo = foreground === '#ffffff' && !(preserveLogoColors && logoUrl);
    const splashBackground = normalizeColor(splashColor, primary);
    const [activeScreen, setActiveScreen] = useState(screen);
    const [plan, setPlan] = useState(6);
    const [notice, setNotice] = useState('');
    useEffect(() => { setActiveScreen(screen); }, [screen]);
    useEffect(() => { setNotice(''); }, [activeScreen]);
    const navigate = (next) => { setActiveScreen(next); onScreenChange?.(next); };
    const name = nomeMarca || 'Sua marca';
    const isLightScreen = ['home', 'thumbnail', 'menu'].includes(activeScreen);
    const shared = { navigate, showNotice: setNotice };
    let content;
    switch (activeScreen) {
        case 'splash': content = <div className={`app-preview-splash ${splashImageUrl ? 'app-preview-splash--image' : ''}`} style={{ background: splashBackground, color: getContrastColor(splashBackground) }}>
            {splashImageUrl ? <img src={splashImageUrl} alt="Imagem da splash personalizada" /> : <BrandLogo logoUrl={logoUrl} nomeMarca={name} inverse={!preserveLogoColors && getContrastColor(splashBackground) === '#ffffff'} />}
        </div>; break;
        case 'login': content = <LoginScreen {...shared} logoUrl={logoUrl} nomeMarca={name} inverse={inverseLogo} />; break;
        case 'menu': content = <MenuScreen {...shared} nomeMarca={name} />; break;
        case 'recarga': content = <RechargeScreen {...shared} plan={plan} setPlan={setPlan} />; break;
        case 'linhas': content = <LinesScreen {...shared} />; break;
        case 'perfil': content = <ProfileScreen {...shared} />; break;
        case 'portabilidade': content = <PortabilityScreen {...shared} />; break;
        default: content = <HomeScreen {...shared} nomeMarca={name} />;
    }
    return <div className="app-preview app-preview--screen"
        style={{ '--app-preview-primary': primary, '--app-preview-on-primary': foreground, '--app-preview-button-ink': ink }}
        aria-label={`Prévia do aplicativo ${name}`}>
        <PhoneFrame corPrimaria={primary} contrastColor={foreground} backgroundColor={activeScreen === 'splash' ? splashBackground : isLightScreen ? '#ffffff' : primary}
            statusColor={activeScreen === 'splash' ? getContrastColor(splashBackground) : isLightScreen ? '#292929' : foreground} screenKey={activeScreen}>
            {content}
            {notice && <div className="app-preview-notice" role="status"><span>{notice}</span><button type="button" aria-label="Fechar aviso da prévia" onClick={() => setNotice('')}><FiX /></button></div>}
        </PhoneFrame>
    </div>;
};

export default AppPreview;
