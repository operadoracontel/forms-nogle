import { useEffect, useState } from 'react';

const PREVIEWABLE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

// Gera a URL local para pré-visualizar o arquivo escolhido e a revoga ao trocar
// ou desmontar — sem o revoke o blob fica preso na memória do navegador.
export const useObjectUrl = (file, allowSvg = false) => {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        if (!file || !(PREVIEWABLE_TYPES.includes(file.type) || (allowSvg && file.type === 'image/svg+xml'))) {
            setUrl(null);
            return undefined;
        }

        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file, allowSvg]);

    return url;
};

export default useObjectUrl;
