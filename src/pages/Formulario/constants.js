import {
    FaGlobe,
    FaMobileAlt,
    FaBolt,
    FaShoppingCart,
    FaBell,
} from 'react-icons/fa';

// `value` é o que trafega para a API — precisa bater exatamente com a lista
// AVAILABLE_PRODUCTS do Cartman (src/modules/brandFormModule.js), que por padrão
// do projeto não usa acentos. `label` é só apresentação.
export const APP_PRODUCT = 'Aplicativo Mobile';

export const PRODUCTS = [
    {
        value: 'Site Web',
        label: 'Site Web',
        description: 'Site institucional e de vendas da sua marca.',
        icon: FaGlobe,
    },
    {
        value: APP_PRODUCT,
        label: 'Aplicativo Mobile',
        description: 'App white label publicado nas lojas com a sua marca.',
        icon: FaMobileAlt,
    },
    {
        value: 'Link de recarga facil',
        label: 'Link de recarga fácil',
        description: 'Link direto para o cliente recarregar em poucos toques.',
        icon: FaBolt,
    },
    {
        value: 'Solucao de Vendas',
        label: 'Solução de Vendas',
        description: 'Estrutura completa de vendas e ativação.',
        icon: FaShoppingCart,
    },
    {
        value: 'Notify',
        label: 'Notify',
        description: 'Disparo de notificações e campanhas para a sua base.',
        icon: FaBell,
    },
];

export const WHATSAPP_NOGLE = 'https://wa.me/5551997079001';

export const APP_LONG_DESCRIPTION_TEMPLATE = `Com o app [Nome da sua Marca], você tem tudo o que precisa na palma da mão.

Controle Total: acompanhe o consumo de internet, minutos e SMS em tempo real.
Recargas: recarregue o seu número ou o de quem você quiser em poucos segundos.
Gestão: contrate, troque de plano e acompanhe as suas faturas sem sair do app.
Atendimento: fale com a nossa equipe direto pelo aplicativo, quando precisar.`;

export const STEPS = [
    { id: 'basico', title: 'Informações básicas' },
    { id: 'identidade', title: 'Identidade visual' },
    { id: 'dominio', title: 'Domínio e acesso' },
    { id: 'contatos', title: 'Contatos extras' },
    { id: 'app', title: 'Aplicativo white label' },
];

export const INITIAL_FORM = {
    companyName: '',
    contactWhatsapp: '',
    products: [],
    primaryColor: '',
    secondaryColor: '',
    logo: null,
    brandManual: null,
    website: '',
    domainRegistrar: '',
    domainLogin: '',
    domainPassword: '',
    domainNotes: '',
    phone0800: '',
    brandWhatsapp: '',
    appName: '',
    appAddress: '',
    appColorOne: '',
    appColorTwo: '',
    appShortDescription: '',
    appLongDescription: '',
};
