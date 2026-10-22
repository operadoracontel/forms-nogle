import React from 'react';
import { Box, Button, Flex, FormControl, FormLabel, SimpleGrid, Switch, Text } from '@chakra-ui/react';
import { FaMobileAlt } from 'react-icons/fa';

import SectionCard from '../../../components/Form/SectionCard';
import TextField from '../../../components/Form/TextField';
import ColorField from '../../../components/Form/ColorField';
import BrandPreview from '../../../components/Preview/BrandPreview';
import AppIdentityPreview from '../../../components/Preview/AppIdentityPreview';
import AppAssetField from '../../../components/Form/AppAssetField';
import { getContrastColor, normalizeColor } from '../../../components/Preview/previewUtils';
import { useObjectUrl } from '../../../hooks/useObjectUrl';
import { getAppDescriptionDefaults } from '../constants';

// Bloco opcional da Identidade visual, disponível conforme a contratação no ERP.
const StepApp = ({ form, errors, setField, hasApp = false }) => {
    const appEnabled = form.appEnabled !== false;
    const brandName = form.companyName?.trim() || '[Nome da sua Marca]';
    const logoFile = form.appLogo || form.logo;
    const logoUrl = useObjectUrl(appEnabled ? logoFile : null, true);
    const iconUrl = useObjectUrl(appEnabled ? form.appLauncherIcon : null);
    const splashImageUrl = useObjectUrl(appEnabled && form.appCustomSplash ? form.appSplashImage : null);
    const splashColor = form.appCustomSplash ? form.appSplashColor || form.appColorOne : form.appColorOne;

    const applyTemplate = () => {
        Object.entries(getAppDescriptionDefaults(brandName)).forEach(([field, value]) => setField(field, value));
    };

    if (!hasApp) return null;

    return (
        <SectionCard
            icon={FaMobileAlt}
            title="Aplicativo white label"
            headerAction={<Flex align="center" gap={3}>
                <Text as="label" htmlFor="app-enabled" fontSize="sm" color="textPrimary" cursor="pointer">Possui aplicativo?</Text>
                <Switch id="app-enabled" aria-label="Possui aplicativo?" size="lg" isChecked={appEnabled}
                    sx={{ '.chakra-switch__track': { bg: 'borderPrimary', _checked: { bg: 'secondary' } }, '.chakra-switch__thumb': { bg: 'white' } }}
                    onChange={(event) => setField('appEnabled', event.target.checked)} />
            </Flex>}
            description={appEnabled ? 'Sua marca possui o Aplicativo Mobile contratado. Precisamos de alguns detalhes a mais para publicá-lo nas lojas com o nome e a cara da sua empresa.' : 'Os campos e as prévias do aplicativo estão desativados. Ative a opção acima para preencher.'}
        >
            {appEnabled && <>
                <TextField
                    label="Nome do aplicativo"
                    value={form.appName}
                    onChange={(value) => setField('appName', value)}
                    error={errors.appName}
                    helper="É o nome que aparece nas lojas (App Store e Google Play)."
                    maxLength={200}
                    isRequired
                />

                <TextField
                    label="Endereço completo da empresa"
                    value={form.appAddress}
                    onChange={(value) => setField('appAddress', value)}
                    error={errors.appAddress}
                    helper="Rua, número, bairro, cidade, estado e CEP — exigido pelas lojas."
                    maxLength={400}
                    multiline
                    rows={3}
                    isRequired
                />

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 5 }}>
                    <ColorField
                        label="Cor primária do aplicativo"
                        value={form.appColorOne}
                        onChange={(value) => setField('appColorOne', value)}
                        error={errors.appColorOne}
                        helper="Formato HEX (ex: #FF5500)."
                        isRequired
                    />

                    <ColorField
                        label="Cor de contraste"
                        value={form.appColorTwo}
                        onChange={(value) => setField('appColorTwo', value)}
                        error={errors.appColorTwo}
                        helper="Texto e ícones sobre a cor primária."
                        isRequired
                    />
                    <ColorField label="Fundo do ícone" value={form.appIconBackgroundColor}
                        onChange={(value) => setField('appIconBackgroundColor', value)} error={errors.appIconBackgroundColor}
                        fallbackColor={normalizeColor(form.appColorOne, '#4A4A50')} helper="Se ficar vazio, acompanha a cor primária." />
                </SimpleGrid>

                <FormControl>
                    <Flex align="center" gap={4} flexWrap="wrap">
                        <FormLabel htmlFor="app-custom-splash" mb={0} fontSize="sm">Splash personalizada</FormLabel>
                        <Switch id="app-custom-splash" aria-label="Splash personalizada" size="lg" isChecked={Boolean(form.appCustomSplash)}
                            sx={{ '.chakra-switch__track': { bg: 'borderPrimary', _checked: { bg: 'secondary' } }, '.chakra-switch__thumb': { bg: 'white' } }}
                            onChange={(event) => setField('appCustomSplash', event.target.checked)} />
                        <Text fontSize="xs" color="textSecondary">{form.appCustomSplash ? 'Cor ou imagem personalizada' : 'Usa a cor primária e o logo do app'}</Text>
                    </Flex>
                </FormControl>
                {form.appCustomSplash && <ColorField label="Cor da splash" value={form.appSplashColor}
                    onChange={(value) => setField('appSplashColor', value)} error={errors.appSplashColor}
                    fallbackColor={normalizeColor(form.appColorOne, '#4A4A50')} helper="Fundo da tela de abertura. Vazio usa a cor primária." />}

                <AppIdentityPreview primaryColor={form.appColorOne} contrastColor={form.appColorTwo}
                    iconBackground={form.appIconBackgroundColor} splashColor={splashColor}
                    logoUrl={logoUrl} iconUrl={iconUrl} splashImageUrl={splashImageUrl} name={form.appName || form.companyName}
                    onAutoContrast={() => setField('appColorTwo', getContrastColor(normalizeColor(form.appColorOne, '#4A4A50')))} />

                <Box border="1px solid" borderColor="borderPrimary" borderRadius="xl" overflow="hidden">
                    <Box px={4} py={3} borderBottom="1px solid" borderColor="borderPrimary">
                        <Text fontSize="sm" fontWeight={700} color="textPrimary">Arquivos do aplicativo</Text>
                        <Text mt={1} fontSize="xs" color="textSecondary">Confira o logo usado dentro do app e o ícone que aparece no celular.</Text>
                    </Box>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} p={4}>
                        <AppAssetField label="Logo do aplicativo" kind="logo" value={form.appLogo} inheritedFile={form.logo}
                            onChange={(file) => setField('appLogo', file)} error={errors.appLogo}
                            helper="PNG, SVG ou JPG, até 20MB. Sem arquivo próprio, usa o logo da marca." />
                        <AppAssetField label="Ícone do aplicativo" kind="icon" value={form.appLauncherIcon}
                            onChange={(file) => setField('appLauncherIcon', file)} error={errors.appLauncherIcon}
                            helper="PNG de 512×512 px, até 20MB. Usado no Android e iOS." />
                        {form.appCustomSplash && <AppAssetField label="Imagem da splash" kind="splash" value={form.appSplashImage}
                            onChange={(file) => setField('appSplashImage', file)} error={errors.appSplashImage}
                            helper="PNG ou JPG opcional, até 20MB. Sem imagem, mostra o logo sobre a cor da splash." />}
                    </SimpleGrid>
                </Box>

                <BrandPreview
                    variant="app"
                    title="Como fica o seu aplicativo"
                    hint="Explore as telas do aplicativo com o nome, o logo e as cores escolhidos acima."
                    primaryColor={form.appColorOne}
                    contrastColor={form.appColorTwo}
                    preserveLogoColors
                    splashColor={splashColor}
                    splashImageUrl={splashImageUrl}
                    logoUrl={logoUrl}
                    brandName={form.appName || form.companyName}
                    hasApp={hasApp}
                    logoPreviewUnavailable={logoFile?.type === 'application/pdf'}
                />

                <Box>
                    <Text fontSize="md" fontWeight={700} color="textPrimary">Descrição</Text>
                    <Text mt={2} fontSize="sm" color="textSecondary">Forneça a descrição completa que será exibida nas lojas de aplicativos (Google Play e App Store) para informar os usuários sobre as funções e vantagens do seu app.</Text>
                </Box>

                <TextField
                    label="Descrição curta"
                    value={form.appShortDescription}
                    onChange={(value) => setField('appShortDescription', value)}
                    error={errors.appShortDescription}
                    helper="Escreva sua descrição ou clique em Usar textos padrão para preencher o modelo."
                    maxLength={400}
                    multiline
                    rows={3}
                    isRequired
                />

                <TextField
                    label="Descrição longa"
                    value={form.appLongDescription}
                    onChange={(value) => setField('appLongDescription', value)}
                    error={errors.appLongDescription}
                    helper="Escreva sua descrição ou use o modelo pelo botão abaixo. Depois, edite como preferir."
                    multiline
                    rows={16}
                    isRequired
                />

                <Button type="button" variant="outline" size="sm" onClick={applyTemplate} alignSelf="flex-start">
                    Usar textos padrão
                </Button>
            </>}
        </SectionCard>
    );
};

export default StepApp;
