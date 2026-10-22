import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Center,
    Flex,
    HStack,
    Progress,
    Spinner,
    Stack,
    Text,
    UnorderedList,
    ListItem,
    useToast,
} from '@chakra-ui/react';
import { FaArrowLeft, FaArrowRight, FaPaperPlane } from 'react-icons/fa';

import PageShell from '../../components/Layout/PageShell';
import LinkInvalido from '../Status/LinkInvalido';
import LinkExpirado from '../Status/LinkExpirado';
import JaEnviado from '../Status/JaEnviado';
import Sucesso from '../Status/Sucesso';

import StepBasico from './steps/StepBasico';
import StepIdentidade from './steps/StepIdentidade';
import StepDominio from './steps/StepDominio';

import { INITIAL_FORM, STEPS } from './constants';
import { buildSubmissionFormData, demoBrandFormContext, parseBrandFormContext } from './context';
import { validateStep, validateAll } from './validation';
import { getBrandForm, submitBrandForm, extractErrors, extractReason } from '../../services/api';

const STEP_COMPONENTS = {
    basico: StepBasico,
    identidade: StepIdentidade,
    dominio: StepDominio,
};

const FormularioPage = () => {
    const { token } = useParams();
    const toast = useToast();

    const [pageState, setPageState] = useState('loading');
    const [blockedReason, setBlockedReason] = useState(null);
    const [submittedAt, setSubmittedAt] = useState(null);
    const [brandName, setBrandName] = useState('');
    const [context, setContext] = useState(null);
    const [loadedToken, setLoadedToken] = useState(token);
    const [attempt, setAttempt] = useState(0);
    const requestVersion = useRef(0);
    const submissionController = useRef(null);

    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [stepIndex, setStepIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasApp = context?.hasApp === true;
    const canSubmit = context?.submissionAvailable === true && token !== 'demo'
        && Number.isSafeInteger(context?.brandId) && context.brandId > 0;
    const steps = STEPS;

    const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
    const isLastStep = stepIndex >= steps.length - 1;

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        requestVersion.current += 1;
        setLoadedToken(token);
        setPageState('loading');
        setBlockedReason(null);
        setSubmittedAt(null);
        setBrandName('');
        setContext(null);
        setForm({ ...INITIAL_FORM });
        setErrors({});
        setStepIndex(0);
        setIsSubmitting(false);

        const loadForm = async () => {
            if (!token) {
                setBlockedReason('NOT_FOUND');
                setPageState('blocked');
                return;
            }
            if (token === 'demo') {
                const demo = demoBrandFormContext();
                setContext(demo);
                setBrandName(demo.brandName);
                setForm({ ...INITIAL_FORM, companyName: demo.brandName });
                setPageState('ready');
                return;
            }

            try {
                const response = await getBrandForm(token, { signal: controller.signal });
                if (!active) return;
                const metadata = parseBrandFormContext(response.data);
                setContext(metadata);
                setBrandName(metadata.brandName);
                setForm({ ...INITIAL_FORM, brandId: metadata.brandId, companyName: metadata.brandName });
                setPageState('ready');
            } catch (error) {
                if (!active || controller.signal.aborted) return;
                // Só o motivo explícito da API prova que o link está bloqueado.
                // Uma rota ausente (404 sem reason) continua sendo indisponibilidade.
                const reason = error?.response?.data?.reason;
                if (['NOT_FOUND', 'ALREADY_SUBMITTED', 'EXPIRED'].includes(reason)) {
                    setBlockedReason(reason);
                    setSubmittedAt(error?.response?.data?.submittedAt || null);
                    setPageState('blocked');
                } else {
                    setPageState('error');
                }
            }
        };

        loadForm();

        return () => {
            active = false;
            controller.abort();
            submissionController.current?.abort();
        };
    }, [token, attempt]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [stepIndex]);

    const setField = useCallback((field, value) => {
        setForm((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => {
            if (field === 'appEnabled' && value === false) {
                return Object.fromEntries(Object.entries(previous).filter(([key]) => !key.startsWith('app')));
            }
            if (!previous[field]) {
                return previous;
            }

            const next = { ...previous };
            delete next[field];
            return next;
        });
    }, []);

    const setBrand = useCallback((brand) => {
        setForm((previous) => ({ ...previous, brandId: brand?.id ?? null, companyName: brand?.name || '' }));
        setErrors((previous) => {
            const next = { ...previous };
            delete next.companyName;
            return next;
        });
    }, []);

    const brandLinkError = () => {
        if (token === 'demo') return null;
        if (!Number.isSafeInteger(context?.brandId) || context.brandId <= 0) {
            return 'Não foi possível identificar a marca deste link. Reabra o formulário.';
        }
        return form.brandId !== context.brandId
            ? `Este link pertence à marca ${context.brandName}. Selecione essa marca na lista.` : null;
    };

    const showValidationToast = (count) => {
        toast({
            title: count === 1 ? 'Falta 1 campo' : `Faltam ${count} campos`,
            description: 'Confira os campos marcados em vermelho antes de continuar.',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
        });
    };

    const handleNext = () => {
        const stepErrors = validateStep(currentStep.id, form, hasApp);
        if (currentStep.id === 'basico' && !stepErrors.companyName) {
            const linkError = brandLinkError();
            if (linkError) stepErrors.companyName = linkError;
        }

        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            showValidationToast(Object.keys(stepErrors).length);
            return;
        }

        setErrors({});
        setStepIndex((previous) => Math.min(previous + 1, steps.length - 1));
    };

    const handleBack = () => {
        setErrors({});
        setStepIndex((previous) => Math.max(previous - 1, 0));
    };

    const handleSubmit = async () => {
        if (!canSubmit || loadedToken !== token || !token || isSubmitting) return;
        const version = requestVersion.current;
        const allErrors = validateAll(form, hasApp);
        const linkError = brandLinkError();
        if (linkError) allErrors.companyName = linkError;

        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            showValidationToast(Object.keys(allErrors).length);

            // Leva o cliente para a primeira etapa que ainda tem pendência.
            const firstInvalid = linkError ? 0 : steps.findIndex(
                (step) => Object.keys(validateStep(step.id, form, hasApp)).length > 0
            );

            if (firstInvalid >= 0) {
                setStepIndex(firstInvalid);
            }

            return;
        }

        setIsSubmitting(true);
        const controller = new AbortController();
        submissionController.current = controller;

        try {
            await submitBrandForm(token, buildSubmissionFormData(form, context), { signal: controller.signal });
            if (version !== requestVersion.current || controller.signal.aborted) return;
            setPageState('success');
        } catch (error) {
            if (version !== requestVersion.current || controller.signal.aborted) return;
            const reason = extractReason(error);

            if (reason === 'ALREADY_SUBMITTED' || reason === 'EXPIRED' || reason === 'NOT_FOUND') {
                setBlockedReason(reason);
                setSubmittedAt(error?.response?.data?.submittedAt || null);
                setPageState('blocked');
                return;
            }

            toast({
                title: 'Não foi possível enviar',
                description: (
                    <UnorderedList>
                        {extractErrors(error).map((message) => (
                            <ListItem key={message}>{message}</ListItem>
                        ))}
                    </UnorderedList>
                ),
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            if (version === requestVersion.current) setIsSubmitting(false);
        }
    };

    if (loadedToken !== token || pageState === 'loading') {
        return (
            <PageShell>
                <Center py={20}>
                    <Stack spacing={4} align="center">
                        <Spinner size="xl" thickness="3px" color="secondary" />
                        <Text fontSize="sm" color="textSecondary">
                            Carregando o seu formulário...
                        </Text>
                    </Stack>
                </Center>
            </PageShell>
        );
    }

    if (pageState === 'error') {
        return <PageShell><Center py={16}><Stack spacing={4} align="center" textAlign="center" maxW="420px">
            <Text fontSize="xl" fontWeight={800} color="textPrimary">Formulário indisponível</Text>
            <Text fontSize="sm" color="textSecondary">Não foi possível carregar seu formulário. Tente novamente mais tarde.</Text>
            <Button onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</Button>
        </Stack></Center></PageShell>;
    }

    if (pageState === 'blocked') {
        if (blockedReason === 'ALREADY_SUBMITTED') {
            return <JaEnviado submittedAt={submittedAt} />;
        }

        if (blockedReason === 'EXPIRED') {
            return <LinkExpirado />;
        }

        return <LinkInvalido />;
    }

    if (pageState === 'success') {
        return <Sucesso brandName={brandName} />;
    }

    const StepComponent = STEP_COMPONENTS[currentStep.id];
    const errorCount = Object.keys(errors).length;

    return (
        <PageShell>
            <Stack spacing={{ base: 4, md: 6 }} pb={{ base: '96px', md: 0 }}>
                <Stack spacing={3}>
                    <Flex justify="space-between" align="baseline" gap={3}>
                        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={800} color="textPrimary">
                            {(token === 'demo' && form.brandId ? form.companyName : brandName) || 'Onboarding da sua marca'}
                        </Text>
                        <Text fontSize="xs" color="textMuted" whiteSpace="nowrap">
                            Etapa {stepIndex + 1} de {steps.length}
                        </Text>
                    </Flex>

                    <Progress
                        value={((stepIndex + 1) / steps.length) * 100}
                        size="sm"
                        borderRadius="full"
                        aria-label="Progresso do formulário"
                    />

                    <Text fontSize="sm" color="textSecondary" fontWeight={600}>
                        {currentStep.title}
                    </Text>
                </Stack>

                {!canSubmit && token !== 'demo' && <Alert status="warning" borderRadius="lg" fontSize="sm"><AlertIcon />O envio está temporariamente indisponível. Tente novamente mais tarde.</Alert>}

                {errorCount > 0 && (
                    <Alert status="error" borderRadius="lg" fontSize="sm">
                        <AlertIcon />
                        {errorCount === 1
                            ? 'Falta 1 campo para continuar. Confira o destaque em vermelho.'
                            : `Faltam ${errorCount} campos para continuar. Confira os destaques em vermelho.`}
                    </Alert>
                )}

                <StepComponent form={form} errors={errors} setField={setField} setBrand={setBrand}
                    contractedProducts={context?.contractedProducts || []} hasApp={hasApp} isDemo={token === 'demo'} />

                <Box
                    position={{ base: 'fixed', md: 'static' }}
                    bottom={0}
                    left={0}
                    right={0}
                    bg={{ base: 'surface', md: 'transparent' }}
                    borderTop={{ base: '1px solid', md: 'none' }}
                    borderColor="borderPrimary"
                    p={{ base: 4, md: 0 }}
                    pb={{ base: 'calc(1rem + env(safe-area-inset-bottom))', md: 0 }}
                    zIndex={5}
                >
                    <HStack maxW="container.md" mx="auto" spacing={3}>
                        <Button
                            variant="outline"
                            leftIcon={<FaArrowLeft />}
                            onClick={handleBack}
                            isDisabled={stepIndex === 0 || isSubmitting}
                            flexShrink={0}
                        >
                            Voltar
                        </Button>

                        {isLastStep ? (
                            <Button
                                rightIcon={<FaPaperPlane />}
                                onClick={handleSubmit}
                                isLoading={isSubmitting}
                                isDisabled={!canSubmit || isSubmitting}
                                loadingText="Enviando..."
                                flex="1"
                            >
                                Enviar formulário
                            </Button>
                        ) : (
                            <Button rightIcon={<FaArrowRight />} onClick={handleNext} flex="1">
                                Continuar
                            </Button>
                        )}
                    </HStack>
                </Box>
            </Stack>
        </PageShell>
    );
};

export default FormularioPage;
