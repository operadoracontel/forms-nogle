import React from 'react';
import { Alert, AlertIcon, Button, SimpleGrid, Text } from '@chakra-ui/react';
import { FaMobileAlt } from 'react-icons/fa';

import SectionCard from '../../../components/Form/SectionCard';
import TextField from '../../../components/Form/TextField';
import ColorField from '../../../components/Form/ColorField';
import { APP_LONG_DESCRIPTION_TEMPLATE } from '../constants';

// Etapa condicional: só entra no fluxo quando "Aplicativo Mobile" foi contratado.
const StepApp = ({ form, errors, setField }) => {
    const brandName = form.companyName?.trim() || '[Nome da sua Marca]';

    const applyTemplate = () => {
        setField(
            'appLongDescription',
            APP_LONG_DESCRIPTION_TEMPLATE.split('[Nome da sua Marca]').join(brandName)
        );
    };

    return (
        <SectionCard
            icon={FaMobileAlt}
            title="Aplicativo white label"
            description="Você incluiu o Aplicativo Mobile no seu pacote. Precisamos de alguns detalhes a mais para publicá-lo nas lojas com o nome e a cara da sua empresa."
        >
            <TextField
                label="Nome do aplicativo"
                value={form.appName}
                onChange={(value) => setField('appName', value)}
                error={errors.appName}
                helper="É o nome que aparece nas lojas (App Store e Google Play)."
                maxLength={200}
                isRequired
            />

            <TextField
                label="Endereço completo da empresa"
                value={form.appAddress}
                onChange={(value) => setField('appAddress', value)}
                error={errors.appAddress}
                helper="Rua, número, bairro, cidade, estado e CEP — exigido pelas lojas."
                maxLength={400}
                multiline
                rows={3}
                isRequired
            />

            <Alert status="warning" borderRadius="lg" fontSize="xs" alignItems="flex-start">
                <AlertIcon boxSize={4} />
                <Text>
                    A cor escolhida para o app <strong>não pode ser a mesma da sua logo</strong>, senão o
                    aplicativo fica sem contraste.
                </Text>
            </Alert>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 5 }}>
                <ColorField
                    label="Cor primária do aplicativo"
                    value={form.appColorOne}
                    onChange={(value) => setField('appColorOne', value)}
                    error={errors.appColorOne}
                    helper="Formato HEX (ex: #FF5500)."
                    isRequired
                />

                <ColorField
                    label="Cor secundária do aplicativo"
                    value={form.appColorTwo}
                    onChange={(value) => setField('appColorTwo', value)}
                    error={errors.appColorTwo}
                    helper="Formato HEX (ex: #021E00)."
                />
            </SimpleGrid>

            <TextField
                label="Descrição curta"
                value={form.appShortDescription}
                onChange={(value) => setField('appShortDescription', value)}
                error={errors.appShortDescription}
                helper={`Ex: "Bem-vindo ao aplicativo da ${brandName}, a sua operadora de telefonia móvel digital que simplifica a sua vida!"`}
                maxLength={400}
                multiline
                rows={3}
                isRequired
            />

            <TextField
                label="Descrição longa"
                value={form.appLongDescription}
                onChange={(value) => setField('appLongDescription', value)}
                error={errors.appLongDescription}
                helper="Descreva o que o cliente encontra no app: controle de consumo, recargas, gestão do plano e atendimento."
                multiline
                rows={8}
                isRequired
            />

            <Button variant="outline" size="sm" onClick={applyTemplate} alignSelf="flex-start">
                Usar texto de modelo
            </Button>
        </SectionCard>
    );
};

export default StepApp;
