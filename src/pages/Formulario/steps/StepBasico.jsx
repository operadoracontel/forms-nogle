import React from 'react';
import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { FaRegBuilding } from 'react-icons/fa';

import SectionCard from '../../../components/Form/SectionCard';
import TextField from '../../../components/Form/TextField';
import BrandCombobox from '../../../components/Form/BrandCombobox';
import { mask0800, maskPhone } from '../../../utils/format';

const StepBasico = ({ form, errors, setField, setBrand }) => (
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
            description="Informe sua marca, os dados do responsável e os canais de atendimento da empresa."
        >
            <BrandCombobox
                value={form.brandId ? { id: form.brandId, name: form.companyName } : null}
                onChange={setBrand}
                error={errors.companyName}
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

            <Box>
                <Text fontSize="sm" fontWeight={700} color="textPrimary">Contatos extras</Text>
                <Text fontSize="sm" mt={1} color="textSecondary">Esses números aparecem para os seus clientes nos canais de atendimento da marca.</Text>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 5 }}>
                <TextField
                    label="Qual é o número 0800 da empresa?"
                    value={form.phone0800}
                    onChange={(value) => setField('phone0800', mask0800(value))}
                    error={errors.phone0800}
                    placeholder="0800 123 4567"
                    inputMode="tel"
                />
                <TextField
                    label="Qual é o número de WhatsApp da marca?"
                    value={form.brandWhatsapp}
                    onChange={(value) => setField('brandWhatsapp', maskPhone(value))}
                    error={errors.brandWhatsapp}
                    placeholder="(51) 99999-9999"
                    inputMode="tel"
                />
            </SimpleGrid>
        </SectionCard>
    </Stack>
);

export default StepBasico;
