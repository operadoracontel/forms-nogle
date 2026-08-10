import React from 'react';
import { FaCheckDouble } from 'react-icons/fa';

import StatusScreen from '../../components/Status/StatusScreen';

const formatDate = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Trava de duplicidade: uma vez concluído, o link só mostra esta tela.
const JaEnviado = ({ submittedAt }) => {
    const formatted = formatDate(submittedAt);

    return (
        <StatusScreen
            icon={FaCheckDouble}
            title="Formulário já enviado"
            description="Já recebemos as informações desta marca. Não é necessário preencher de novo — se algum dado mudou, fale com a nossa equipe que atualizamos para você."
            detail={formatted ? `Enviado em ${formatted}.` : null}
            showWhatsapp
        />
    );
};

export default JaEnviado;
