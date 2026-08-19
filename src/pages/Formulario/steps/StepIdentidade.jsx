import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { FaPalette } from 'react-icons/fa';

import SectionCard from '../../../components/Form/SectionCard';
import ColorField from '../../../components/Form/ColorField';
import FileField from '../../../components/Form/FileField';
import BrandPreview from '../../../components/Preview/BrandPreview';
import { useObjectUrl } from '../../../hooks/useObjectUrl';

const StepIdentidade = ({ form, errors, setField }) => {
    const logoUrl = useObjectUrl(form.logo);

    return (
        <SectionCard
            icon={FaPalette}
            title="Identidade visual da marca"
            description="Precisamos dos materiais gráficos da sua marca para alinhar o produto à identidade da sua empresa. Preencha com os itens de que dispuser — se faltar algum material, fique tranquilo: é só nos chamar no WhatsApp que ajudamos em todo o processo."
        >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 5 }}>
                <ColorField
                    label="Qual é a cor principal da sua marca?"
                    value={form.primaryColor}
                    onChange={(value) => setField('primaryColor', value)}
                    error={errors.primaryColor}
                    helper="Formato HEX (ex: #02EA75)."
                />

                <ColorField
                    label="Qual é a cor secundária da sua marca?"
                    value={form.secondaryColor}
                    onChange={(value) => setField('secondaryColor', value)}
                    error={errors.secondaryColor}
                    helper="Formato HEX (ex: #021E00)."
                />
            </SimpleGrid>

            <FileField
                label="Envie o logo da sua marca"
                value={form.logo}
                onChange={(file) => setField('logo', file)}
                error={errors.logo}
                helper="PNG, JPG ou PDF, até 20MB."
                accept=".png,.jpg,.jpeg,.pdf"
            />

            <BrandPreview
                variant="erp"
                title="Como fica no seu painel"
                hint="A cor principal veste o topo e o menu; a secundária marca as ações."
                primaryColor={form.primaryColor}
                secondaryColor={form.secondaryColor}
                logoUrl={logoUrl}
                brandName={form.companyName}
            />

            <FileField
                label="Envie o manual de marca / brand guideline (opcional)"
                value={form.brandManual}
                onChange={(file) => setField('brandManual', file)}
                error={errors.brandManual}
                helper="PDF, PNG, JPG ou ZIP, até 20MB."
                accept=".png,.jpg,.jpeg,.pdf,.zip"
            />
        </SectionCard>
    );
};

export default StepIdentidade;
