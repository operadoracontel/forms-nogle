import React from 'react';
import { FaUnlink } from 'react-icons/fa';

import StatusScreen from '../../components/Status/StatusScreen';

const LinkInvalido = () => (
    <StatusScreen
        icon={FaUnlink}
        title="Link inválido"
        description="Este link não existe ou foi desativado. Confira se você copiou o endereço completo que a equipe da Nogle enviou."
        showWhatsapp
    />
);

export default LinkInvalido;
