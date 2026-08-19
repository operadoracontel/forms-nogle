import React from 'react';
import { Box, Flex, HStack, Image, Stack, Text } from '@chakra-ui/react';

import { isValidHex, readableTextOn, withAlpha } from '../../utils/color';

const NEUTRAL = '#4A4A50';
const NEUTRAL_ACCENT = '#8A8A92';

const resolve = (color, fallback) => (isValidHex(color) ? color : fallback);

const Skeleton = ({ w, color, h }) => (
    <Box w={w} h={h || '6px'} borderRadius="full" bg={color} />
);

// Painel web (ERP white label) pintado com as cores da marca.
const ErpMockup = ({ primary, secondary, logoUrl, brandName }) => {
    const headerText = readableTextOn(primary);

    return (
        <Box
            w="100%"
            borderRadius="lg"
            overflow="hidden"
            border="1px solid"
            borderColor="borderPrimary"
            bg="surface"
        >
            <Flex h="34px" align="center" justify="space-between" px={3} bg={primary}>
                <HStack spacing={2} minW={0}>
                    {logoUrl ? (
                        <Image src={logoUrl} alt="" h="16px" maxW="72px" objectFit="contain" />
                    ) : (
                        <Text fontSize="10px" fontWeight={800} color={headerText} noOfLines={1}>
                            {brandName || 'SUA MARCA'}
                        </Text>
                    )}
                </HStack>

                <HStack spacing={1}>
                    <Box w="6px" h="6px" borderRadius="full" bg={withAlpha(headerText, 0.5)} />
                    <Box w="6px" h="6px" borderRadius="full" bg={withAlpha(headerText, 0.5)} />
                </HStack>
            </Flex>

            <Flex h="104px">
                <Stack w="44px" bg={withAlpha(primary, 0.85)} p={2} spacing={2} flexShrink={0}>
                    <Skeleton w="60%" color={withAlpha(headerText, 0.75)} />
                    <Skeleton w="85%" color={withAlpha(headerText, 0.35)} />
                    <Skeleton w="70%" color={withAlpha(headerText, 0.35)} />
                    <Skeleton w="80%" color={withAlpha(headerText, 0.35)} />
                </Stack>

                <Stack flex="1" p={2.5} spacing={2} bg="surfaceRaised">
                    <HStack spacing={2}>
                        <Stack flex="1" bg="surface" borderRadius="md" p={2} spacing={1.5}>
                            <Skeleton w="55%" color={secondary} />
                            <Skeleton w="80%" color="borderPrimary" />
                        </Stack>
                        <Stack flex="1" bg="surface" borderRadius="md" p={2} spacing={1.5}>
                            <Skeleton w="45%" color={secondary} />
                            <Skeleton w="70%" color="borderPrimary" />
                        </Stack>
                    </HStack>

                    <Flex
                        h="20px"
                        w="76px"
                        borderRadius="md"
                        bg={secondary}
                        align="center"
                        justify="center"
                    >
                        <Text fontSize="8px" fontWeight={800} color={readableTextOn(secondary)}>
                            AÇÃO
                        </Text>
                    </Flex>
                </Stack>
            </Flex>
        </Box>
    );
};

// Aplicativo white label pintado com as cores do app.
const AppMockup = ({ primary, secondary, logoUrl, brandName }) => {
    const headerText = readableTextOn(primary);

    return (
        <Box
            w="152px"
            borderRadius="20px"
            overflow="hidden"
            border="5px solid"
            borderColor="borderPrimary"
            bg="surface"
            mx="auto"
        >
            <Stack spacing={0} bg={primary} pb={3}>
                <Flex justify="center" pt={1.5} pb={1}>
                    <Box w="34px" h="4px" borderRadius="full" bg={withAlpha(headerText, 0.4)} />
                </Flex>

                <Stack px={3} spacing={2} align="center">
                    {logoUrl ? (
                        <Image src={logoUrl} alt="" h="20px" maxW="86px" objectFit="contain" />
                    ) : (
                        <Text fontSize="10px" fontWeight={800} color={headerText} noOfLines={1}>
                            {brandName || 'SUA MARCA'}
                        </Text>
                    )}

                    <Text fontSize="8px" color={withAlpha(headerText, 0.8)}>
                        Meu plano
                    </Text>
                </Stack>
            </Stack>

            <Stack p={2.5} spacing={2} mt="-10px">
                <Stack bg="surface" borderRadius="md" p={2} spacing={1.5} boxShadow="sm">
                    <Skeleton w="50%" color="borderPrimary" />
                    <Skeleton w="75%" color={primary} h="8px" />
                </Stack>

                <HStack spacing={2}>
                    <Flex flex="1" h="22px" borderRadius="md" bg={secondary} align="center" justify="center">
                        <Text fontSize="7px" fontWeight={800} color={readableTextOn(secondary)}>
                            RECARGA
                        </Text>
                    </Flex>
                    <Flex flex="1" h="22px" borderRadius="md" bg={withAlpha(secondary, 0.18)} align="center" justify="center">
                        <Text fontSize="7px" fontWeight={800} color={secondary}>
                            PLANOS
                        </Text>
                    </Flex>
                </HStack>
            </Stack>

            <HStack h="26px" borderTop="1px solid" borderColor="borderPrimary" justify="space-around" px={3}>
                <Box w="7px" h="7px" borderRadius="full" bg={primary} />
                <Box w="7px" h="7px" borderRadius="full" bg="borderPrimary" />
                <Box w="7px" h="7px" borderRadius="full" bg="borderPrimary" />
            </HStack>
        </Box>
    );
};

const Legend = ({ items }) => (
    <HStack spacing={4} flexWrap="wrap">
        {items.map((item) => (
            <HStack key={item.label} spacing={1.5}>
                <Box
                    w="12px"
                    h="12px"
                    borderRadius="sm"
                    bg={item.color}
                    border="1px solid"
                    borderColor="borderPrimary"
                />
                <Text fontSize="xs" color="textSecondary">
                    {item.label}
                </Text>
            </HStack>
        ))}
    </HStack>
);

/**
 * Pré-visualização ao vivo da identidade da marca.
 * `variant="erp"` pinta o painel web, `variant="app"` pinta o aplicativo.
 * Cor inválida ou vazia cai num cinza neutro — o cliente vê que ainda falta.
 */
const BrandPreview = ({ variant, primaryColor, secondaryColor, logoUrl, brandName, title, hint }) => {
    const primary = resolve(primaryColor, NEUTRAL);
    const secondary = resolve(secondaryColor, NEUTRAL_ACCENT);

    return (
        <Box bg="surfaceRaised" borderRadius="lg" p={{ base: 3, md: 4 }}>
            <Stack spacing={3}>
                <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight={700} color="textPrimary">
                        {title}
                    </Text>
                    <Text fontSize="xs" color="textMuted">
                        {hint || 'Prévia aproximada — atualiza conforme você preenche.'}
                    </Text>
                </Stack>

                {variant === 'app' ? (
                    <AppMockup primary={primary} secondary={secondary} logoUrl={logoUrl} brandName={brandName} />
                ) : (
                    <ErpMockup primary={primary} secondary={secondary} logoUrl={logoUrl} brandName={brandName} />
                )}

                <Legend
                    items={[
                        { label: isValidHex(primaryColor) ? primaryColor : 'Cor principal pendente', color: primary },
                        { label: isValidHex(secondaryColor) ? secondaryColor : 'Cor secundária pendente', color: secondary },
                    ]}
                />
            </Stack>
        </Box>
    );
};

export default BrandPreview;
