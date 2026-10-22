import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Flex, FormControl, FormErrorMessage, Image, Text } from '@chakra-ui/react';
import { FiImage, FiRefreshCw, FiUpload, FiX } from 'react-icons/fi';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { readImageDimensions, validateAppAsset } from '../../utils/appAssets';

/** Upload local; só aplica imagens válidas e preserva o arquivo anterior se falhar. */
export default function AppAssetField({ label, kind, value, inheritedFile, onChange, error, helper }) {
    const inputRef = useRef(null);
    const pending = useRef(null);
    const [localError, setLocalError] = useState('');
    const [reading, setReading] = useState(false);
    const preview = useObjectUrl(value || inheritedFile, kind === 'logo');
    useEffect(() => () => pending.current?.abort(), []);
    const choose = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        pending.current?.abort();
        const controller = new AbortController();
        pending.current = controller;
        const problem = validateAppAsset(file, kind);
        if (problem) { setLocalError(problem); setReading(false); return; }
        setLocalError('');
        setReading(true);
        try {
            const size = await readImageDimensions(file, controller.signal);
            if (controller.signal.aborted) return;
            if (kind === 'icon' && (size.width !== 512 || size.height !== 512)) {
                setLocalError(`O ícone precisa ter 512×512 px. O arquivo escolhido tem ${size.width}×${size.height} px.`);
                return;
            }
            onChange(file);
        } catch (problem) {
            if (!controller.signal.aborted) setLocalError(problem.message);
        } finally {
            if (!controller.signal.aborted) setReading(false);
        }
    };
    const clear = () => {
        pending.current?.abort();
        setReading(false);
        setLocalError('');
        onChange(null);
    };
    return <FormControl isInvalid={Boolean(error || localError)} minW={0}>
        <Box border="1px solid" borderColor={error || localError ? 'danger' : 'borderPrimary'} borderRadius="xl" overflow="hidden">
            <Flex h="126px" p={4} align="center" justify="center" bg="#dfe5ec"
                bgImage="repeating-conic-gradient(#e9edf2 0% 25%, #dfe5ec 0% 50%)" bgSize="18px 18px">
                {preview ? <Image src={preview} alt={`Arquivo: ${label}`} maxW="100%" maxH="100%" objectFit="contain" /> : <Box as={FiImage} color="#6b7280" boxSize={8} />}
            </Flex>
            <Box p={3}>
                <Text fontSize="sm" fontWeight={700} color="textPrimary">{label}</Text>
                <Text fontSize="xs" color="textSecondary" mt={1}>{helper}</Text>
                <Text fontSize="xs" color="textMuted" mt={1} noOfLines={1}>{value?.name || (inheritedFile ? 'Usando o logo da marca' : 'Nenhum arquivo enviado')}</Text>
                <input ref={inputRef} type="file" aria-label={label} accept={kind === 'icon' ? '.png' : kind === 'logo' ? '.png,.svg,.jpg,.jpeg' : '.png,.jpg,.jpeg'} onChange={choose} style={{ display: 'none' }} />
                <Flex gap={2} mt={3}>
                    <Button type="button" size="xs" w="full" variant="outline" leftIcon={value ? <FiRefreshCw /> : <FiUpload />} isLoading={reading}
                        aria-label={`${value ? 'Substituir' : 'Selecionar'} ${label}`} onClick={() => inputRef.current?.click()}>{value ? 'Substituir' : 'Selecionar arquivo'}</Button>
                    {value && <Button type="button" size="xs" variant="ghost" aria-label={`Remover ${label}`} onClick={clear}><FiX /></Button>}
                </Flex>
            </Box>
        </Box>
        {(error || localError) && <FormErrorMessage>{error || localError}</FormErrorMessage>}
    </FormControl>;
}
