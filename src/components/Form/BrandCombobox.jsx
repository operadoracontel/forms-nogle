import React, { useEffect, useId, useMemo, useState } from 'react';
import {
    Box, Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel,
    HStack, Input, Spinner, Text,
} from '@chakra-ui/react';
import { getBrandCatalog } from '../../services/api';
import { filterBrands, normalizeBrandName, resolveBrandSelection } from '../../utils/brandSearch';

const MAX_VISIBLE = 50;
const parseCatalog = (data) => {
    if (!Array.isArray(data?.brands) || data.brands.some((brand) => !Number.isSafeInteger(brand.id)
        || brand.id <= 0 || typeof brand.name !== 'string' || !brand.name.trim())) {
        throw new Error('Catálogo de marcas inválido.');
    }
    return data.brands;
};

/** Pesquisa somente registros existentes; o texto digitado nunca vira uma marca nova. */
const BrandCombobox = ({ value, onChange, error }) => {
    const generatedId = useId();
    const inputId = `brand-search-${generatedId}`;
    const listId = `brand-options-${generatedId}`;
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [query, setQuery] = useState(value?.id ? value.name : '');
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const matches = useMemo(() => filterBrands(brands, query), [brands, query]);
    const visible = matches.slice(0, MAX_VISIBLE);

    useEffect(() => {
        if (value?.id) setQuery(value.name);
    }, [value?.id, value?.name]);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        setLoading(true);
        setLoadError(false);
        getBrandCatalog({ signal: controller.signal }).then((response) => {
            const catalog = parseCatalog(response.data);
            if (active) setBrands(catalog);
        }).catch(() => {
            if (active && !controller.signal.aborted) setLoadError(true);
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; controller.abort(); };
    }, [attempt]);

    const choose = (brand) => {
        setQuery(brand.name);
        setOpen(false);
        setActiveIndex(-1);
        onChange(brand);
    };
    const settle = () => {
        const match = resolveBrandSelection(brands, query);
        if (match) choose(match);
        else setOpen(false);
    };
    const updateQuery = (text) => {
        setQuery(text);
        setOpen(true);
        setActiveIndex(-1);
        const match = resolveBrandSelection(brands, text);
        // Só a correspondência completa seleciona enquanto a pessoa digita.
        // Prefixos e pequenas correções são confirmados ao sair do campo/Enter.
        onChange(match && normalizeBrandName(match.name) === normalizeBrandName(text) ? match : null);
    };
    const keyDown = (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => visible.length ? (current + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length : -1);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (open && visible[activeIndex]) choose(visible[activeIndex]);
            else settle();
        } else if (event.key === 'Escape') setOpen(false);
    };

    return <FormControl isRequired isInvalid={Boolean(error)}>
        <FormLabel htmlFor={inputId}>Qual é sua marca?</FormLabel>
        <Box position="relative">
            <Input id={inputId} role="combobox" aria-label="Qual é sua marca?" aria-autocomplete="list"
                aria-expanded={open && !loading && !loadError} aria-controls={listId}
                aria-activedescendant={open && visible[activeIndex] ? `${listId}-${visible[activeIndex].id}` : undefined}
                value={query} onChange={(event) => updateQuery(event.target.value)}
                onFocus={() => setOpen(true)} onBlur={settle} onKeyDown={keyDown}
                placeholder={loading ? 'Carregando marcas...' : 'Digite para encontrar sua marca'}
                autoComplete="off" fontSize={{ base: '16px', md: 'sm' }} isDisabled={loading || loadError} />
            {open && !loading && !loadError && <Box id={listId} role="listbox" aria-label="Marcas cadastradas"
                position="absolute" top="calc(100% + 6px)" left={0} right={0} zIndex={20}
                maxH="260px" overflowY="auto" bg="surface" border="1px solid" borderColor="borderPrimary"
                borderRadius="lg" boxShadow="lg" p={1}>
                {visible.map((brand, index) => <Box as="button" type="button" role="option" id={`${listId}-${brand.id}`}
                    key={brand.id} aria-selected={value?.id === brand.id} tabIndex={-1}
                    display="block" w="full" textAlign="left" px={3} py={2.5} borderRadius="md"
                    bg={index === activeIndex || value?.id === brand.id ? 'secondarySubtle' : 'transparent'}
                    _hover={{ bg: 'surfaceHover' }} onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(brand)}>
                    <Flex align="center" justify="space-between" gap={3}>
                        <Text color="textPrimary" fontSize="sm" fontWeight={600}>{brand.name}</Text>
                        <Text color="textMuted" fontSize="xs" flexShrink={0}>#{brand.id}</Text>
                    </Flex>
                </Box>)}
                {!visible.length && <Text px={3} py={3} fontSize="sm" color="textSecondary">Nenhuma marca encontrada. Escolha uma marca cadastrada.</Text>}
                {matches.length > MAX_VISIBLE && <Text px={3} py={2} fontSize="xs" color="textMuted">Continue digitando para filtrar as {matches.length} marcas encontradas.</Text>}
            </Box>}
        </Box>
        {loading && <HStack mt={2} spacing={2}><Spinner size="xs" /><Text fontSize="xs" color="textSecondary">Buscando marcas cadastradas.</Text></HStack>}
        {loadError && <Flex mt={2} align="center" gap={3} flexWrap="wrap">
            <Text fontSize="xs" color="textSecondary">Não foi possível carregar a lista de marcas.</Text>
            <Button type="button" size="xs" variant="outline" onClick={() => setAttempt((current) => current + 1)}>Tentar novamente</Button>
        </Flex>}
        {error ? <FormErrorMessage>{error}</FormErrorMessage> : <FormHelperText fontSize="xs" color="textMuted">
            {value?.id ? `Marca selecionada: ${value.name} · #${value.id}` : 'Digite o nome e escolha a marca na lista. Somente marcas cadastradas são aceitas.'}
        </FormHelperText>}
    </FormControl>;
};

export default BrandCombobox;
