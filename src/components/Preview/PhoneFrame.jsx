import React, { useEffect, useRef } from 'react';
import { FiBattery, FiWifi } from 'react-icons/fi';
import { normalizeColor, getContrastColor } from './previewUtils';
import './AppPreview.css';

/** Moldura de apresentação; conteúdo rolável e ações sem dados reais. */
const PhoneFrame = ({ children, corPrimaria, contrastColor, statusColor, backgroundColor, screenKey }) => {
    const primary = normalizeColor(corPrimaria);
    const background = backgroundColor || primary;
    const contentRef = useRef(null);
    useEffect(() => { contentRef.current?.scrollTo?.({ top: 0, left: 0 }); }, [screenKey]);
    return <div className="app-preview-phone" style={{
        '--app-preview-primary': primary,
        '--app-preview-on-primary': normalizeColor(contrastColor, getContrastColor(primary)),
        '--app-preview-status-color': statusColor || getContrastColor(primary),
        '--app-preview-screen-bg': background,
        '--app-preview-indicator-color': getContrastColor(background),
    }}>
        <div className="app-preview-phone__screen">
            <div className="app-preview-phone__status" aria-hidden="true"><span>9:41</span><span className="app-preview-phone__status-icons"><i /><FiWifi /><FiBattery /></span></div>
            <div className="app-preview-phone__island" aria-hidden="true" />
            <div ref={contentRef} className="app-preview-phone__content">{children}</div>
            <span className="app-preview-phone__home-indicator" aria-hidden="true" />
        </div>
    </div>;
};

export default PhoneFrame;
