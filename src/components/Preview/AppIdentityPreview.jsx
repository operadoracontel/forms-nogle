import React from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { FiSmartphone } from 'react-icons/fi';
import { getContrastColor, getContrastRatio, normalizeColor } from './previewUtils';
import './AppIdentityPreview.css';

export default function AppIdentityPreview({ primaryColor, contrastColor, iconBackground, splashColor, logoUrl, iconUrl, splashImageUrl, name, onAutoContrast }) {
    const primary = normalizeColor(primaryColor, '#4a4a50');
    const contrast = normalizeColor(contrastColor, getContrastColor(primary));
    const iconBg = normalizeColor(iconBackground, primary);
    const splash = normalizeColor(splashColor, primary);
    const ratio = getContrastRatio(primary, contrast);
    const ready = Boolean(normalizeColor(primaryColor, null));
    const appName = name?.trim() || 'Seu aplicativo';
    const logo = (color) => logoUrl ? <img src={logoUrl} alt={`Logo do aplicativo ${appName}`} /> : <strong style={{ color }}>{appName}</strong>;
    return <Box border="1px solid" borderColor="borderPrimary" bg="surfaceRaised" borderRadius="xl" p={{ base: 3, md: 4 }} color="textPrimary">
        <Flex align="center" justify="space-between" gap={3} mb={4} flexWrap="wrap">
            <Text fontSize="sm" fontWeight={700}>Prévia de contraste</Text>
            <Text fontSize="xs" color={ready ? (ratio >= 4.5 ? 'secondary' : 'warning') : 'textMuted'} aria-live="polite">
                {ready ? `${ratio.toFixed(2)}:1 · ${ratio >= 4.5 ? 'Bom contraste de texto' : 'Contraste de texto baixo'}` : 'Escolha a cor primária'}
            </Text>
        </Flex>
        <div className="app-identity-preview__grid">
            <figure className="app-identity-preview__logo"><div style={{ background: primary, color: contrast }}>{logo(contrast)}</div><figcaption>Logo dentro do app</figcaption></figure>
            {['Android', 'iOS'].map((platform) => <figure key={platform} className="app-identity-preview__icon"><div style={{ background: iconBg, color: getContrastColor(iconBg) }}>
                {iconUrl ? <img src={iconUrl} alt={`Ícone ${platform}`} /> : <FiSmartphone aria-label="Ícone ainda não enviado" />}
            </div><figcaption>{platform}</figcaption></figure>)}
            <figure className="app-identity-preview__splash"><div style={{ background: splash, color: getContrastColor(splash) }}>
                {splashImageUrl ? <img className="app-identity-preview__splash-image" src={splashImageUrl} alt="Splash personalizada" /> : logo(getContrastColor(splash))}
            </div><figcaption>Splash screen</figcaption></figure>
            <figure className="app-identity-preview__text"><div style={{ background: primary, color: contrast }}><strong>{appName}</strong></div><figcaption>Contraste de texto</figcaption></figure>
        </div>
        <Flex mt={3} gap={3} justify="space-between" align="center" flexWrap="wrap">
            <Text fontSize="xs" color="textSecondary" flex="1" minW="180px">Compare o logo com o fundo. As imagens mantêm as cores originais.</Text>
            <Button type="button" size="xs" variant="outline" onClick={onAutoContrast}>Ajustar contraste automaticamente</Button>
        </Flex>
    </Box>;
}
