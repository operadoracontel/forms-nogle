import React from 'react';
import {
    Box,
    FormControl,
    FormErrorMessage,
    FormLabel,
    HStack,
    Icon,
    SimpleGrid,
    Stack,
    Text,
} from '@chakra-ui/react';
import { FaCheck } from 'react-icons/fa';

import { PRODUCTS } from '../../pages/Formulario/constants';

// Seleção múltipla de produtos como cards clicáveis — alvo de toque grande no
// celular e preview do que a Nogle entrega em cada item.
const ProductPicker = ({ value, onChange, error }) => {
    const selected = value || [];

    const toggle = (productValue) => {
        if (selected.includes(productValue)) {
            onChange(selected.filter((item) => item !== productValue));
            return;
        }

        onChange([...selected, productValue]);
    };

    return (
        <FormControl isInvalid={Boolean(error)} isRequired>
            <FormLabel>Qual(is) produto(s) da Nogle você contratou?</FormLabel>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {PRODUCTS.map((product) => {
                    const isSelected = selected.includes(product.value);

                    return (
                        <Box
                            key={product.value}
                            as="button"
                            type="button"
                            onClick={() => toggle(product.value)}
                            aria-pressed={isSelected}
                            textAlign="left"
                            bg={isSelected ? 'secondarySubtle' : 'surfaceRaised'}
                            border="2px solid"
                            borderColor={isSelected ? 'secondary' : 'borderPrimary'}
                            borderRadius="lg"
                            p={4}
                            transition="all 0.15s ease-in-out"
                            _hover={{ borderColor: 'secondary' }}
                        >
                            <Stack spacing={2}>
                                <HStack justify="space-between" align="center">
                                    <HStack spacing={2}>
                                        <Icon as={product.icon} color="secondary" boxSize={4} />
                                        <Text fontSize="sm" fontWeight={700} color="textPrimary">
                                            {product.label}
                                        </Text>
                                    </HStack>

                                    <Box
                                        w="20px"
                                        h="20px"
                                        borderRadius="md"
                                        border="2px solid"
                                        borderColor={isSelected ? 'secondary' : 'borderPrimary'}
                                        bg={isSelected ? 'secondary' : 'transparent'}
                                        color="primary"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                    >
                                        {isSelected && <Icon as={FaCheck} boxSize={2.5} />}
                                    </Box>
                                </HStack>

                                <Text fontSize="xs" color="textSecondary" lineHeight="tall">
                                    {product.description}
                                </Text>
                            </Stack>
                        </Box>
                    );
                })}
            </SimpleGrid>

            <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>
    );
};

export default ProductPicker;
