import React from 'react';
import { Alert, AlertIcon, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { FaGlobeAmericas, FaLock } from 'react-icons/fa';

import SectionCard from '../../../components/Form/SectionCard';
import TextField from '../../../components/Form/TextField';

// Seção prioritária do NOGLE-27602: é o dado que trava o projeto de ir ao ar.
// Por isso o card vem destacado e com aviso quando fica vazio.
const StepDominio = ({ form, errors, setField }) => {
    const isEmpty =
        !form.website?.trim() && !form.domainRegistrar?.trim() && !form.domainLogin?.trim();

    return (
        <SectionCard
            icon={FaGlobeAmericas}
            title="Domínio e acesso"
            badge="PRIORIDADE"
            highlight
            description="O domínio é o endereço da sua marca na internet (ex: suaempresa.com.br). Para que o seu projeto vá ao ar e funcione perfeitamente, nossa equipe técnica precisa realizar alguns apontamentos e configurações internas. Para isso, precisamos do login e da senha da plataforma onde o seu domínio foi registrado (como Registro.br, HostGator, etc.)."
        >
            <HStack
                bg="surfaceRaised"
                border="1px solid"
                borderColor="borderPrimary"
                borderRadius="lg"
                p={3}
                spacing={3}
                align="flex-start"
            >
                <Icon as={FaLock} color="secondary" boxSize={4} mt={0.5} />
                <Text fontSize="xs" color="textSecondary" lineHeight="tall">
                    Fique tranquilo(a): tratamos esses dados com total sigilo e segurança. O acesso será
                    utilizado exclusivamente para a ativação do seu produto. Caso tenha dificuldade para
                    localizar esses dados, nossa equipe está pronta para te auxiliar no WhatsApp.
                </Text>
            </HStack>

            {isEmpty && (
                <Alert status="warning" borderRadius="lg" fontSize="xs" alignItems="flex-start">
                    <AlertIcon boxSize={4} />
                    <Stack spacing={0}>
                        <Text fontWeight={700}>Sem o domínio o projeto não vai ao ar.</Text>
                        <Text>
                            Se ainda não tem essas informações em mãos, siga o preenchimento e nos chame
                            no WhatsApp — resolvemos junto com você.
                        </Text>
                    </Stack>
                </Alert>
            )}

            <TextField
                label="Qual é o endereço do site da sua empresa?"
                value={form.website}
                onChange={(value) => setField('website', value)}
                error={errors.website}
                placeholder="suaempresa.com.br"
                inputMode="url"
                maxLength={300}
            />

            <TextField
                label="Onde seu domínio foi registrado?"
                value={form.domainRegistrar}
                onChange={(value) => setField('domainRegistrar', value)}
                error={errors.domainRegistrar}
                helper="Ex: Registro.br, HostGator, GoDaddy, Hostinger."
                maxLength={200}
            />

            <TextField
                label="Login do painel onde o domínio foi registrado"
                value={form.domainLogin}
                onChange={(value) => setField('domainLogin', value)}
                error={errors.domainLogin}
                placeholder="E-mail, CPF/CNPJ ou usuário do painel"
                autoComplete="off"
                maxLength={200}
            />

            <TextField
                label="Senha do painel"
                value={form.domainPassword}
                onChange={(value) => setField('domainPassword', value)}
                error={errors.domainPassword}
                helper="Armazenada de forma criptografada e usada só para a ativação."
                type="password"
                autoComplete="new-password"
            />

            <TextField
                label="Prefere nos passar o acesso de outra forma? Conte aqui."
                value={form.domainNotes}
                onChange={(value) => setField('domainNotes', value)}
                error={errors.domainNotes}
                helper="Ex: convite de usuário no painel, acesso por telefone, autenticação em duas etapas."
                multiline
                rows={4}
            />
        </SectionCard>
    );
};

export default StepDominio;
