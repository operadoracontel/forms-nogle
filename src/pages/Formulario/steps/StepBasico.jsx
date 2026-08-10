import React from 'react';
import { Box, Stack, Text } from '@chakra-ui/react';
import { FaRegBuilding } from 'react-icons/fa';

import SectionCard from '../../../components/Form/SectionCard';
import TextField from '../../../components/Form/TextField';
import ProductPicker from '../../../components/Form/ProductPicker';
import { maskPhone } from '../../../utils/format';

const StepBasico = ({ form, errors, setField }) => (
    <Stack spacing={{ base: 4, md: 6 }}>
        <Box
            bg="secondarySubtle"
            border="1px solid"
            borderColor="secondary"
            borderRadius="xl"
            p={{ base: 4, md: 5 }}
        >
            <Text fontSize="sm" color="textPrimary" lineHeight="tall">
                Olá! Aqui é a equipe da <strong>Nogle Tech</strong>. Para darmos andamento à produção
                do(s) produto(s) que você contratou, precisamos coletar algumas informações sobre a sua
                marca. Este formulário leva cerca de 5 a 10 minutos para ser preenchido. Qualquer
                dúvida, é só nos chamar no WhatsApp!
            </Text>
        </Box>

        <SectionCard
            icon={FaRegBuilding}
            title="Informações básicas"
            description="Comece pelos dados de contato e pelo que você contratou com a gente."
        >
            <TextField
                label="Qual é o nome da sua empresa / marca?"
                value={form.companyName}
                onChange={(value) => setField('companyName', value)}
                error={errors.companyName}
                placeholder="Ex: Minha Operadora"
                maxLength={200}
                isRequired
            />

            <TextField
                label="Qual é o WhatsApp do responsável para contato?"
                value={form.contactWhatsapp}
                onChange={(value) => setField('contactWhatsapp', maskPhone(value))}
                error={errors.contactWhatsapp}
                helper="Usamos este número para falar com você durante a produção."
                placeholder="(51) 99999-9999"
                inputMode="tel"
                isRequired
            />

            <ProductPicker
                value={form.products}
                onChange={(value) => setField('products', value)}
                error={errors.products}
            />
        </SectionCard>
    </Stack>
);

export default StepBasico;
