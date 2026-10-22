import React, { useState } from 'react';

const BrandLogo = ({ logoUrl, nomeMarca = 'Sua marca', inverse = false }) => {
    const [failedUrl, setFailedUrl] = useState(null);
    const showImage = logoUrl && failedUrl !== logoUrl;
    return (
        <span className={`preview-brand-logo${inverse ? ' preview-brand-logo--inverse' : ''}`}>
            {showImage ? (
                <img src={logoUrl} alt={nomeMarca} onError={() => setFailedUrl(logoUrl)} />
            ) : (
                <span className="preview-brand-wordmark">{nomeMarca}</span>
            )}
        </span>
    );
};

export default BrandLogo;
