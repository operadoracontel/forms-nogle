import React, { useRef } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    HStack,
    Icon,
    IconButton,
    Image,
    Text,
} from '@chakra-ui/react';
import { FaCloudUploadAlt, FaFileAlt, FaTimes } from 'react-icons/fa';

import { formatFileSize } from '../../utils/format';
import { useObjectUrl } from '../../hooks/useObjectUrl';

// Upload de arquivo único. Área grande e clicável para funcionar bem no celular.
// Quando o arquivo é imagem, mostra a miniatura — o cliente confere na hora se
// mandou o arquivo certo.
const FileField = ({ label, value, onChange, error, helper, accept, isRequired }) => {
    const inputRef = useRef(null);
    const previewUrl = useObjectUrl(value);

    const handleSelect = (event) => {
        const file = event.target.files?.[0] || null;
        onChange(file);
    };

    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
        }

        onChange(null);
    };

    return (
        <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
            <FormLabel>{label}</FormLabel>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleSelect}
                style={{ display: 'none' }}
            />

            {value ? (
                <HStack
                    bg="surfaceRaised"
                    border="1px solid"
                    borderColor="borderPrimary"
                    borderRadius="lg"
                    p={3}
                    spacing={3}
                >
                    {previewUrl ? (
                        <Box
                            w="56px"
                            h="56px"
                            borderRadius="md"
                            bg="surface"
                            border="1px solid"
                            borderColor="borderPrimary"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            p={1}
                            flexShrink={0}
                        >
                            <Image
                                src={previewUrl}
                                alt={`Prévia de ${label}`}
                                maxH="100%"
                                maxW="100%"
                                objectFit="contain"
                            />
                        </Box>
                    ) : (
                        <Icon as={FaFileAlt} color="secondary" boxSize={5} />
                    )}

                    <Box flex="1" minW={0}>
                        <Text fontSize="sm" fontWeight={600} color="textPrimary" noOfLines={1}>
                            {value.name}
                        </Text>
                        <Text fontSize="xs" color="textMuted">
                            {formatFileSize(value.size)}
                        </Text>
                    </Box>

                    <IconButton
                        aria-label="Remover arquivo"
                        icon={<FaTimes />}
                        size="sm"
                        variant="ghost"
                        onClick={handleClear}
                    />
                </HStack>
            ) : (
                <Button
                    onClick={() => inputRef.current?.click()}
                    variant="outline"
                    w="100%"
                    h="auto"
                    py={6}
                    borderStyle="dashed"
                    borderWidth="2px"
                    flexDirection="column"
                    gap={2}
                    fontWeight={600}
                >
                    <Icon as={FaCloudUploadAlt} boxSize={6} color="secondary" />
                    <Text fontSize="sm">Selecionar arquivo</Text>
                </Button>
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

export default FileField;
