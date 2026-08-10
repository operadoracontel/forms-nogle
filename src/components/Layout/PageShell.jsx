import React from 'react';
import {
    Box,
    Container,
    Flex,
    HStack,
    IconButton,
    Image,
    Text,
    useColorMode,
} from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';

import nogleLogo from '../../assets/Nogle_Simbolo_Verde_Neon.svg';

// Casca visual de todas as telas: header enxuto com a marca, conteúdo centralizado
// e rodapé. Mobile-first — o container só cresce a partir do breakpoint md.
const PageShell = ({ children }) => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Flex direction="column" minH="100dvh" bg="background">
            <Box
                as="header"
                position="sticky"
                top={0}
                zIndex={10}
                bg="surface"
                borderBottom="1px solid"
                borderColor="borderPrimary"
            >
                <Container maxW="container.md" px={{ base: 4, md: 6 }}>
                    <Flex h={{ base: '56px', md: '64px' }} align="center" justify="space-between">
                        <HStack spacing={3}>
                            <Image src={nogleLogo} alt="Nogle" h={{ base: '26px', md: '30px' }} />
                            <Text fontWeight={800} fontSize={{ base: 'sm', md: 'md' }} color="textPrimary">
                                Nogle Tech
                            </Text>
                        </HStack>

                        <IconButton
                            aria-label={colorMode === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                            icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
                            onClick={toggleColorMode}
                            variant="ghost"
                            size="sm"
                        />
                    </Flex>
                </Container>
            </Box>

            <Box as="main" flex="1" py={{ base: 5, md: 10 }}>
                <Container maxW="container.md" px={{ base: 4, md: 6 }}>
                    {children}
                </Container>
            </Box>

            <Box as="footer" py={5} borderTop="1px solid" borderColor="borderSubtle">
                <Container maxW="container.md" px={{ base: 4, md: 6 }}>
                    <Text fontSize="xs" color="textMuted" textAlign="center">
                        © {new Date().getFullYear()} Nogle Tech. Todos os direitos reservados.
                    </Text>
                </Container>
            </Box>
        </Flex>
    );
};

export default PageShell;
