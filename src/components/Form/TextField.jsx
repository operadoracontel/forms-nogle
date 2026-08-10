import React from 'react';
import {
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Input,
    Textarea,
} from '@chakra-ui/react';

// Campo de texto padrão do formulário. `multiline` troca Input por Textarea.
// fontSize base 16px evita o zoom automático do Safari iOS ao focar o campo.
const TextField = ({
    label,
    value,
    onChange,
    error,
    helper,
    isRequired,
    placeholder,
    type,
    multiline,
    rows,
    maxLength,
    autoComplete,
    inputMode,
}) => {
    const sharedProps = {
        value: value || '',
        onChange: (event) => onChange(event.target.value),
        placeholder,
        maxLength,
        autoComplete,
        inputMode,
        fontSize: { base: '16px', md: 'sm' },
    };

    return (
        <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
            <FormLabel>{label}</FormLabel>

            {multiline ? (
                <Textarea {...sharedProps} rows={rows || 5} resize="vertical" />
            ) : (
                <Input {...sharedProps} type={type || 'text'} />
            )}

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

export default TextField;
