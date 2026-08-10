import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

import StatusScreen from '../../components/Status/StatusScreen';

const Sucesso = ({ brandName }) => (
    <StatusScreen
        icon={FaCheckCircle}
        title="Recebemos tudo!"
        description={
            brandName
                ? `Obrigado! As informações da ${brandName} chegaram para a nossa equipe e a produção do seu produto já pode seguir.`
                : 'Obrigado! As informações chegaram para a nossa equipe e a produção do seu produto já pode seguir.'
        }
        detail="Se precisarmos de algum detalhe a mais, entramos em contato pelo WhatsApp informado."
        showWhatsapp
    />
);

export default Sucesso;
