import React from 'react';
import { Box, Button, Icon, Link, Stack, Text } from '@chakra-ui/react';
import { FaWhatsapp } from 'react-icons/fa';

import PageShell from '../Layout/PageShell';
import { WHATSAPP_NOGLE } from '../../pages/Formulario/constants';

// Tela de estado final (sucesso, link inválido, link expirado, já enviado).
const StatusScreen = ({ icon, iconColor, title, description, detail, showWhatsapp }) => (
    <PageShell>
        <Box
            bg="surface"
            border="1px solid"
            borderColor="borderPrimary"
            borderRadius="xl"
            p={{ base: 6, md: 10 }}
            textAlign="center"
        >
            <Stack spacing={5} align="center">
                <Box
                    bg="secondarySubtle"
                    color={iconColor || 'secondary'}
                    borderRadius="full"
                    w="72px"
                    h="72px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Icon as={icon} boxSize={8} />
                </Box>

                <Stack spacing={3}>
                    <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={800} color="textPrimary">
                        {title}
                    </Text>

                    <Text fontSize="sm" color="textSecondary" lineHeight="tall">
                        {description}
                    </Text>

                    {detail && (
                        <Text fontSize="xs" color="textMuted">
                            {detail}
                        </Text>
                    )}
                </Stack>

                {showWhatsapp && (
                    <Button
                        as={Link}
                        href={WHATSAPP_NOGLE}
                        isExternal
                        leftIcon={<FaWhatsapp />}
                        w={{ base: '100%', md: 'auto' }}
                        _hover={{ textDecoration: 'none' }}
                    >
                        Falar com a Nogle no WhatsApp
                    </Button>
                )}
            </Stack>
        </Box>
    </PageShell>
);

export default StatusScreen;
