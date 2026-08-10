import React from 'react';
import { Badge, Box, HStack, Icon, Stack, Text } from '@chakra-ui/react';

// Card de seção do formulário. `highlight` liga o destaque neon usado na seção de
// domínio (NOGLE-27602 pede prioridade visual nessa etapa).
const SectionCard = ({ icon, title, description, badge, highlight, children }) => (
    <Box
        bg="surface"
        border="1px solid"
        borderColor={highlight ? 'secondary' : 'borderPrimary'}
        borderRadius="xl"
        p={{ base: 4, md: 6 }}
        boxShadow={highlight ? '0 0 0 3px rgba(2,234,117,0.12)' : 'none'}
    >
        <Stack spacing={{ base: 4, md: 5 }}>
            <Stack spacing={2}>
                <HStack spacing={3} align="center">
                    {icon && (
                        <Box
                            bg="secondarySubtle"
                            color="secondary"
                            borderRadius="lg"
                            p={2}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon as={icon} boxSize={4} />
                        </Box>
                    )}

                    <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight={800} color="textPrimary">
                        {title}
                    </Text>

                    {badge && (
                        <Badge bg="secondary" color="primary" borderRadius="md" px={2} py={0.5} fontSize="2xs">
                            {badge}
                        </Badge>
                    )}
                </HStack>

                {description && (
                    <Text fontSize="sm" color="textSecondary" lineHeight="tall">
                        {description}
                    </Text>
                )}
            </Stack>

            <Stack spacing={{ base: 4, md: 5 }}>{children}</Stack>
        </Stack>
    </Box>
);

export default SectionCard;
