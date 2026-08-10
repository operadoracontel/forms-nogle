import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { FaHeadset } from 'react-icons/fa';

import SectionCard from '../../../components/Form/SectionCard';
import TextField from '../../../components/Form/TextField';
import { mask0800, maskPhone } from '../../../utils/format';

const StepContatos = ({ form, errors, setField }) => (
    <SectionCard
        icon={FaHeadset}
        title="Contatos extras"
        description="Esses números aparecem para os seus clientes nos canais de atendimento da marca."
    >
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
);

export default StepContatos;
