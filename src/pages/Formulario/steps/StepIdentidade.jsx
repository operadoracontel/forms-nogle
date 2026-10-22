import React from 'react';
import { SimpleGrid, Stack } from '@chakra-ui/react';
import { FaPalette } from 'react-icons/fa';

import SectionCard from '../../../components/Form/SectionCard';
import ColorField from '../../../components/Form/ColorField';
import FileField from '../../../components/Form/FileField';
import BrandPreview from '../../../components/Preview/BrandPreview';
import { useObjectUrl } from '../../../hooks/useObjectUrl';
import StepApp from './StepApp';

const StepIdentidade = ({ form, errors, setField, contractedProducts = [], hasApp = false, isDemo = false }) => {
    const logoUrl = useObjectUrl(form.logo);

    return (
        <Stack spacing={{ base: 4, md: 6 }}>
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

                <FileField
                    label="Identidade visual"
                    value={form.brandManual}
                    onChange={(file) => setField('brandManual', file)}
                    error={errors.brandManual}
                    helper="PDF, PNG, JPG ou ZIP, até 20MB."
                    accept=".png,.jpg,.jpeg,.pdf,.zip"
                />

                <BrandPreview
                    variant="solutions"
                    title="Veja sua marca nas soluções"
                    primaryColor={form.primaryColor}
                    logoUrl={logoUrl}
                    brandName={form.companyName}
                    contractedProducts={contractedProducts}
                    hasApp={hasApp}
                    appEnabled={form.appEnabled !== false}
                    isDemo={isDemo}
                    logoPreviewUnavailable={form.logo?.type === 'application/pdf'}
                />
            </SectionCard>
            {hasApp && <StepApp form={form} errors={errors} setField={setField} hasApp={hasApp} />}
        </Stack>
    );
};

export default StepIdentidade;
