import React from 'react';
import { FaHourglassEnd } from 'react-icons/fa';

import StatusScreen from '../../components/Status/StatusScreen';

const LinkExpirado = () => (
    <StatusScreen
        icon={FaHourglassEnd}
        title="Link expirado"
        description="O prazo deste link acabou. Fale com a equipe da Nogle e nós geramos um novo para você em instantes."
        showWhatsapp
    />
);

export default LinkExpirado;
