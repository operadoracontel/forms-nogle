import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import StepContatos from './steps/StepContatos';
import StepApp from './steps/StepApp';

import { APP_PRODUCT, INITIAL_FORM, STEPS } from './constants';
import { validateStep, validateAll } from './validation';
import { getBrandForm, submitBrandForm, extractErrors, extractReason } from '../../services/api';

const STEP_COMPONENTS = {
    basico: StepBasico,
    identidade: StepIdentidade,
    dominio: StepDominio,
    contatos: StepContatos,
    app: StepApp,
};

const FormularioPage = () => {
    const { token } = useParams();
    const toast = useToast();

    const [pageState, setPageState] = useState('loading');
    const [blockedReason, setBlockedReason] = useState(null);
    const [submittedAt, setSubmittedAt] = useState(null);
    const [brandName, setBrandName] = useState('');

    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [stepIndex, setStepIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Etapa do app só entra no fluxo quando o produto foi contratado.
    const steps = useMemo(
        () => STEPS.filter((step) => step.id !== 'app' || form.products.includes(APP_PRODUCT)),
        [form.products]
    );

    const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
    const isLastStep = stepIndex >= steps.length - 1;

    useEffect(() => {
        let active = true;

        const loadForm = async () => {
            try {
                const response = await getBrandForm(token);

                if (!active) {
                    return;
                }

                setBrandName(response.data.brandName || '');
                setForm((previous) => ({ ...previous, companyName: response.data.brandName || '' }));
                setPageState('ready');
            } catch (error) {
                if (!active) {
                    return;
                }

                setBlockedReason(extractReason(error));
                setSubmittedAt(error?.response?.data?.submittedAt || null);
                setPageState('blocked');
            }
        };

        loadForm();

        return () => {
            active = false;
        };
    }, [token]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [stepIndex]);

    const setField = useCallback((field, value) => {
        setForm((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => {
            if (!previous[field]) {
                return previous;
            }

            const next = { ...previous };
            delete next[field];
            return next;
        });
    }, []);

    const buildFormData = () => {
        const payload = {
            companyName: form.companyName,
            contactWhatsapp: form.contactWhatsapp,
            products: form.products,
            primaryColor: form.primaryColor,
            secondaryColor: form.secondaryColor,
            website: form.website,
            domainRegistrar: form.domainRegistrar,
            domainLogin: form.domainLogin,
            domainPassword: form.domainPassword,
            domainNotes: form.domainNotes,
            phone0800: form.phone0800,
            brandWhatsapp: form.brandWhatsapp,
        };

        if (form.products.includes(APP_PRODUCT)) {
            payload.appName = form.appName;
            payload.appAddress = form.appAddress;
            payload.appColorOne = form.appColorOne;
            payload.appColorTwo = form.appColorTwo;
            payload.appShortDescription = form.appShortDescription;
            payload.appLongDescription = form.appLongDescription;
        }

        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));

        if (form.logo) {
            formData.append('logo', form.logo);
        }

        if (form.brandManual) {
            formData.append('brandManual', form.brandManual);
        }

        return formData;
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
        const stepErrors = validateStep(currentStep.id, form);

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
        const allErrors = validateAll(form);

        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            showValidationToast(Object.keys(allErrors).length);

            // Leva o cliente para a primeira etapa que ainda tem pendência.
            const firstInvalid = steps.findIndex(
                (step) => Object.keys(validateStep(step.id, form)).length > 0
            );

            if (firstInvalid >= 0) {
                setStepIndex(firstInvalid);
            }

            return;
        }

        setIsSubmitting(true);

        try {
            await submitBrandForm(token, buildFormData());
            setPageState('success');
        } catch (error) {
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
            setIsSubmitting(false);
        }
    };

    if (pageState === 'loading') {
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
                            {brandName || 'Onboarding da sua marca'}
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

                {errorCount > 0 && (
                    <Alert status="error" borderRadius="lg" fontSize="sm">
                        <AlertIcon />
                        {errorCount === 1
                            ? 'Falta 1 campo para continuar. Confira o destaque em vermelho.'
                            : `Faltam ${errorCount} campos para continuar. Confira os destaques em vermelho.`}
                    </Alert>
                )}

                <StepComponent form={form} errors={errors} setField={setField} />

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
