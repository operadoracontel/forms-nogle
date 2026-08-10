import React from 'react';
import {
    Box,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    HStack,
    Input,
} from '@chakra-ui/react';

import { HEX_COLOR, normalizeHex } from '../../utils/format';

// Cor em HEX: seletor nativo + campo de texto. Os dois escrevem o mesmo valor,
// então quem tem o código da marca digita, e quem não tem escolhe no seletor.
const ColorField = ({ label, value, onChange, error, helper, isRequired }) => {
    const swatch = HEX_COLOR.test(String(value || '').trim()) ? value : '#FFFFFF';

    return (
        <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
            <FormLabel>{label}</FormLabel>

            <HStack spacing={3}>
                <Box
                    as="input"
                    type="color"
                    value={swatch}
                    onChange={(event) => onChange(normalizeHex(event.target.value))}
                    aria-label={`Seletor de cor: ${label}`}
                    w="48px"
                    h="40px"
                    minW="48px"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="borderPrimary"
                    bg="surface"
                />

                <Input
                    value={value || ''}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={(event) => onChange(normalizeHex(event.target.value))}
                    placeholder="#02EA75"
                    maxLength={7}
                    fontSize={{ base: '16px', md: 'sm' }}
                />
            </HStack>

            {error ? (
                <FormErrorMessage>{error}</FormErrorMessage>
            ) : (
                helper && (
                    <FormHelperText fontSize="xs" color="textMuted">
                        {helper}
                    </FormHelperText>
                )
            )}
        </FormControl>
    );
};

export default ColorField;
