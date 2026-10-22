import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    Box, Button, Flex, HStack, Icon, Modal, ModalBody, ModalCloseButton,
    ModalContent, ModalHeader, ModalOverlay, Stack, Text, useColorModeValue, useDisclosure,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiMonitor, FiSmartphone } from 'react-icons/fi';
import AppPreview from './AppPreview';
import VendaPreview from './VendaPreview';
import SitePreview from './SitePreview';
import RecargaPreview from './RecargaPreview';
import { normalizeColor } from './previewUtils';
import './Preview.css';
import './BrandPreview.css';

const PREVIEWS = {
    app: { label: 'Aplicativo', Component: AppPreview, screens: [['login', 'Entrar'], ['thumbnail', 'Apresentação'], ['splash', 'Splash'], ['home', 'Início'], ['recarga', 'Recarga'], ['linhas', 'Linhas'], ['menu', 'Menu'], ['perfil', 'Perfil'], ['portabilidade', 'Portabilidade']] },
    vendas: { label: 'Solução de Vendas', product: 'Solucao de Vendas', Component: VendaPreview, screens: [['inicio', 'Planos'], ['checkout', 'Configurar plano'], ['pagamento', 'Pagamento'], ['confirmacao', 'Próximos passos']] },
    site: { label: 'Site Webpresence', product: 'Site Web', Component: SitePreview, screens: [['inicio', 'Página inicial'], ['planos', 'Planos'], ['vantagens', 'Vantagens'], ['aplicativo', 'Nosso app'], ['faq', 'Perguntas frequentes']] },
    recarga: { label: 'Recarga-Fácil', product: 'Link de recarga facil', Component: RecargaPreview, screens: [['inicio', 'Linha'], ['seguranca', 'Segurança'], ['planos', 'Planos'], ['pagamento', 'Pagamento'], ['confirmacao', 'Concluída']] },
};

// Preserva as proporções do layout original em vez de comprimir suas colunas.
const WebCanvas = ({ mobile, children }) => {
    const outerRef = useRef(null);
    const innerRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const naturalWidth = mobile ? 390 : 1040;
    useLayoutEffect(() => {
        const measure = () => {
            const width = outerRef.current?.clientWidth || 0;
            const height = innerRef.current?.scrollHeight || 0;
            setSize((current) => current.width === width && current.height === height ? current : { width, height });
        };
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(outerRef.current);
        observer.observe(innerRef.current);
        return () => observer.disconnect();
    }, [naturalWidth]);
    const scale = size.width ? Math.min(1, size.width / naturalWidth) : 1;
    return <div ref={outerRef} className="form-preview-canvas" style={{ height: size.height ? size.height * scale : undefined }}>
        <div ref={innerRef} className="form-preview-canvas__content" style={{ width: naturalWidth, transform: `scale(${scale})`, left: size.width > naturalWidth ? (size.width - naturalWidth) / 2 : 0 }}>
            {children}
        </div>
    </div>;
};

// Mantém as proporções do celular e reserva espaço para as setas nas laterais.
const AppCanvas = ({ expanded, children, onPrevious, onNext }) => {
    const outerRef = useRef(null);
    const innerRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0, maxHeight: 644 });
    useLayoutEffect(() => {
        const measure = () => {
            const width = outerRef.current?.clientWidth || 0;
            const height = innerRef.current?.scrollHeight || 0;
            const maxHeight = expanded ? Math.max(1, window.innerHeight * 0.72 - 32) : 644;
            setSize((current) => current.width === width && current.height === height && current.maxHeight === maxHeight
                ? current : { width, height, maxHeight });
        };
        measure();
        window.addEventListener('resize', measure);
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
        if (observer) {
            observer.observe(outerRef.current);
            observer.observe(innerRef.current);
        }
        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [expanded]);
    const naturalWidth = 326;
    const scale = size.height ? Math.min(1, size.maxHeight / size.height, size.width ? Math.max(1, size.width - 104) / naturalWidth : 1) : 1;
    return <div ref={outerRef} className="form-preview-canvas form-app-carousel" role="group" aria-label="Navegação das telas do aplicativo"
        style={{ height: size.height ? size.height * scale : undefined, '--app-carousel-phone-width': `${310 * scale}px` }}>
        <Button type="button" className="form-app-carousel__arrow form-app-carousel__arrow--previous" variant="outline"
            aria-label="Tela anterior do aplicativo" onClick={onPrevious}><FiChevronLeft aria-hidden="true" /></Button>
        <div ref={innerRef} className="form-preview-canvas__content" style={{ width: naturalWidth, transform: `scale(${scale})`, left: Math.max(0, (size.width - naturalWidth * scale) / 2) }}>
            {children}
        </div>
        <Button type="button" className="form-app-carousel__arrow form-app-carousel__arrow--next" variant="outline"
            aria-label="Próxima tela do aplicativo" onClick={onNext}><FiChevronRight aria-hidden="true" /></Button>
    </div>;
};

/** Prévias baseadas nas cópias locais dos produtos, personalizadas pela marca. */
const BrandPreview = ({ variant = 'solutions', primaryColor, contrastColor, preserveLogoColors = false, splashColor, splashImageUrl, logoUrl, brandName, title, hint, contractedProducts = [], hasApp = false, appEnabled = true, isDemo = false, logoPreviewUnavailable = false }) => {
    const available = variant === 'app'
        ? (hasApp && appEnabled ? ['app'] : [])
        : Object.keys(PREVIEWS).filter((id) => id === 'app' ? appEnabled && (isDemo || hasApp) : isDemo || contractedProducts.includes(PREVIEWS[id].product));
    const [activeProduct, setActiveProduct] = useState(available[0]);
    const [activeScreen, setActiveScreen] = useState('login');
    const [mobile, setMobile] = useState(true);
    const product = available.includes(activeProduct) ? activeProduct : available[0];
    const selected = PREVIEWS[product];
    const screen = selected?.screens.some(([id]) => id === activeScreen) ? activeScreen : selected?.screens[0]?.[0];
    const { isOpen, onOpen, onClose } = useDisclosure();
    const activeColor = useColorModeValue('primary', 'secondary');
    const primary = normalizeColor(primaryColor, '#4A4A50');
    const contrast = normalizeColor(contrastColor, null);
    const stageRef = useRef(null);
    const expandedStageRef = useRef(null);
    const modalBodyRef = useRef(null);

    useEffect(() => {
        // O Webpresence posiciona a seção escolhida dentro da própria prévia.
        if (product === 'site') return;
        const reset = () => {
            // Mantém o foco no começo da nova tela; o focus-lock do modal não
            // precisa procurar um botão de ação no rodapé do conteúdo substituído.
            const stage = isOpen ? expandedStageRef.current : stageRef.current;
            // Uma mudança externa (como Possui aplicativo?) mantém o foco no
            // controle do formulário, mesmo quando troca o produto disponível.
            if (isOpen || document.activeElement === document.body || stage?.closest('.form-brand-preview')?.contains(document.activeElement)) {
                stage?.focus?.({ preventScroll: true });
            }
            stageRef.current?.scrollTo?.({ top: 0, left: 0, behavior: 'instant' });
            expandedStageRef.current?.scrollTo?.({ top: 0, left: 0, behavior: 'instant' });
            modalBodyRef.current?.scrollTo?.({ top: 0, behavior: 'instant' });
        };
        reset();
        const frame = requestAnimationFrame(reset);
        return () => cancelAnimationFrame(frame);
    }, [product, screen, mobile, isOpen]);

    if (!selected) return null;
    const Preview = selected.Component;
    const screenIndex = selected.screens.findIndex(([id]) => id === screen);
    const moveScreen = (direction) => setActiveScreen(selected.screens[(screenIndex + direction + selected.screens.length) % selected.screens.length][0]);
    const selectProduct = (id) => { setActiveProduct(id); setActiveScreen(PREVIEWS[id].screens[0][0]); };
    const moveProduct = (direction) => selectProduct(available[(available.indexOf(product) + direction + available.length) % available.length]);
    const controls = (expanded = false) => <Stack spacing={3} mb={4}>
        {available.length > 1 && <Flex gap={2} align="center">
            <Button type="button" size="sm" variant="outline" aria-label="Produto anterior" onClick={() => moveProduct(-1)}><FiChevronLeft aria-hidden="true" /></Button>
            <Flex flex={1} gap={2} flexWrap="wrap" role="group" aria-label="Soluções para visualizar">
                {available.map((id) => <Button key={id} type="button" size="sm" aria-pressed={product === id}
                    variant={product === id ? 'solid' : 'outline'} colorScheme={product === id ? 'green' : undefined}
                    onClick={() => selectProduct(id)}>{PREVIEWS[id].label}</Button>)}
            </Flex>
            <Button type="button" size="sm" variant="outline" aria-label="Próximo produto" onClick={() => moveProduct(1)}><FiChevronRight aria-hidden="true" /></Button>
        </Flex>}
        <Flex gap={3} flexWrap="wrap" align="center" justify="space-between">
            <Flex gap={1} flexWrap="wrap" role="group" aria-label="Telas da prévia">
                {selected.screens.map(([id, label]) => <Button key={id} type="button" size="xs" aria-pressed={screen === id}
                    variant={screen === id ? 'outline' : 'ghost'} color={screen === id ? activeColor : 'textSecondary'}
                    onClick={() => setActiveScreen(id)}>{label}</Button>)}
            </Flex>
            {product !== 'app' && <HStack spacing={1} role="group" aria-label="Formato da prévia">
                <Button type="button" size="xs" aria-pressed={!mobile} variant={!mobile ? 'outline' : 'ghost'} onClick={() => setMobile(false)}><Icon as={FiMonitor} mr={1} />Desktop</Button>
                <Button type="button" size="xs" aria-pressed={mobile} variant={mobile ? 'outline' : 'ghost'} onClick={() => setMobile(true)}><Icon as={FiSmartphone} mr={1} />Mobile</Button>
            </HStack>}
            <HStack spacing={2}>
                <Text fontSize="xs" color="textSecondary" minW="38px" textAlign="center" aria-live="polite">{screenIndex + 1} / {selected.screens.length}</Text>
                {!expanded && <Button type="button" size="xs" variant="ghost" leftIcon={<FiMaximize2 />} onClick={onOpen}>Ampliar prévia</Button>}
            </HStack>
        </Flex>
    </Stack>;
    const canvas = (expanded = false) => {
        const content = <Preview key={product} logoUrl={logoUrl} corPrimaria={primary} nomeMarca={brandName || 'Sua marca'}
            contrastColor={contrast} preserveLogoColors={preserveLogoColors} splashColor={splashColor} splashImageUrl={splashImageUrl}
            screen={screen} mobile={mobile} onScreenChange={setActiveScreen} />;
        return <div className="preview-capture">{product === 'app' ? <AppCanvas expanded={expanded} onPrevious={() => moveScreen(-1)} onNext={() => moveScreen(1)}>{content}</AppCanvas> : <WebCanvas mobile={mobile}>{content}</WebCanvas>}</div>;
    };
    const stage = (expanded = false) => <Box className={product === 'app' ? undefined : 'form-web-carousel'}>
        {product !== 'app' && <Button type="button" className="form-web-carousel__arrow form-web-carousel__arrow--previous" variant="outline"
            aria-label={`Tela anterior: ${selected.label}`} onClick={() => moveScreen(-1)}><FiChevronLeft aria-hidden="true" /></Button>}
        <Box ref={expanded ? expandedStageRef : stageRef} tabIndex={-1} aria-label={expanded ? 'Área da prévia ampliada' : 'Área da prévia'}
            className="form-brand-preview__stage" bg="surfaceRaised" p={expanded ? { base: 2, md: 4 } : { base: 2, md: 3 }}
            maxH={expanded ? '72dvh' : '680px'} overflow="auto" borderRadius="lg">{canvas(expanded)}</Box>
        {product !== 'app' && <Button type="button" className="form-web-carousel__arrow form-web-carousel__arrow--next" variant="outline"
            aria-label={`Próxima tela: ${selected.label}`} onClick={() => moveScreen(1)}><FiChevronRight aria-hidden="true" /></Button>}
    </Box>;
    return <Box className="form-brand-preview" border="1px solid" borderColor="borderPrimary" borderRadius="xl" overflow="hidden" minW={0}>
        <Box p={{ base: 3, md: 4 }}>
            <Text fontSize="sm" fontWeight={800} color="textPrimary">{title || 'Veja sua marca nas soluções'}</Text>
            <Text fontSize="xs" color="textSecondary" mt={1} mb={4}>{hint || 'Escolha uma solução e explore as telas com o nome, a cor e o logo da sua marca.'}</Text>
            {controls()}
            {stage()}
            <Flex mt={3} gap={4} flexWrap="wrap" fontSize="xs" color="textSecondary">
                <HStack spacing={1.5}><Box w="12px" h="12px" borderRadius="sm" border="1px solid" borderColor="borderPrimary" bg={primary} />
                    <Text>{normalizeColor(primaryColor, null) ? primary : 'Cor primária pendente'}</Text></HStack>
                <HStack spacing={1.5}><Box w="12px" h="12px" borderRadius="sm" border="1px solid" borderColor="gray.300" bg={product === 'app' && contrast ? contrast : 'white'} /><Text>{product === 'app' && contrast ? 'Cor de contraste' : 'Branco como secundária no layout'}</Text></HStack>
            </Flex>
            {logoPreviewUnavailable && <Text mt={2} fontSize="xs" color="textSecondary">O arquivo PDF será mantido. Para visualizar o logo aqui, use PNG ou JPG.</Text>}
            <Text mt={2} fontSize="xs" color="textMuted">Confira como sua marca aparece em cada solução.</Text>
        </Box>
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent className="form-brand-preview" bg="surface" color="textPrimary" mx={{ base: 2, md: 6 }} maxH="94dvh">
                <ModalHeader pr={12}>{selected.label} · {brandName || 'Sua marca'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody ref={modalBodyRef} pb={5}>
                    {controls(true)}
                    {stage(true)}
                </ModalBody>
            </ModalContent>
        </Modal>
    </Box>;
};

export default BrandPreview;
