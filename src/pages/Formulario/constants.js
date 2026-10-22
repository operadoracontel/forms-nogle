// Valores canônicos do contrato: recebidos do ERP, nunca escolhidos no formulário.
export const APP_PRODUCT = 'Aplicativo Mobile';
export const PRODUCT_VALUES = ['Site Web', APP_PRODUCT, 'Link de recarga facil', 'Solucao de Vendas', 'Notify'];

export const WHATSAPP_NOGLE = 'https://wa.me/5551997079001';

export const APP_SHORT_DESCRIPTION_TEMPLATE = 'Bem-vindo ao aplicativo da [Nome da sua Marca], a sua operadora de telefonia móvel digital que simplifica a sua vida!';

export const APP_LONG_DESCRIPTION_TEMPLATE = `Bem-vindo ao aplicativo da [Nome da sua Marca], a sua operadora de telefonia móvel digital que simplifica a sua vida!

Com o app [Nome da sua Marca], você tem tudo o que precisa na palma da mão:

Controle Total: Acompanhe seus planos, saldos e consumo de dados em tempo real.

Recargas e Pagamentos: Recarregue e efetue pagamentos de forma prática e rápida diretamente no app.

Gestão Simplificada: Alterne planos, contrate pacotes extras e resolva tudo sem burocracia.

Atendimento Facilitado: Conte com suporte personalizado sempre que precisar, de forma simples e eficiente.

Aqui, você tem liberdade, praticidade e zero complicações. Baixe agora e descubra como é fácil gerenciar sua linha com a [Nome da sua Marca]! 🚀`;

export const getAppDescriptionDefaults = (brandName) => {
    const name = brandName?.trim() || '[Nome da sua Marca]';
    const personalize = (template) => template.split('[Nome da sua Marca]').join(name);
    return {
        appShortDescription: personalize(APP_SHORT_DESCRIPTION_TEMPLATE),
        appLongDescription: personalize(APP_LONG_DESCRIPTION_TEMPLATE),
    };
};

export const STEPS = [
    { id: 'basico', title: 'Informações básicas' },
    { id: 'identidade', title: 'Identidade visual' },
    { id: 'dominio', title: 'Domínio e acesso' },
];

export const INITIAL_FORM = {
    brandId: null,
    companyName: '',
    contactWhatsapp: '',
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
    appEnabled: false,
    appAddress: '',
    appColorOne: '',
    appColorTwo: '#FFFFFF',
    appIconBackgroundColor: '',
    appCustomSplash: false,
    appSplashColor: '',
    appLogo: null,
    appLauncherIcon: null,
    appSplashImage: null,
    appShortDescription: '',
    appLongDescription: '',
};
