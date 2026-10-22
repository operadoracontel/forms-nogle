import React from 'react';
import { FiLock, FiMoreHorizontal } from 'react-icons/fi';
import './Preview.css';

const BrowserFrame = ({ children, mobile = false, address = 'sua-marca.com.br' }) => (
    <div className={`preview-browser${mobile ? ' preview-browser--mobile' : ''}`}>
        <div className="preview-browser-toolbar" aria-hidden="true">
            <div className="preview-browser-dots"><i /><i /><i /></div>
            <div className="preview-browser-address"><FiLock size={10} /><span>{address}</span></div>
            <FiMoreHorizontal />
        </div>
        <div className="preview-browser-content">{children}</div>
    </div>
);

export default BrowserFrame;
