import React from 'react';
import { FiArrowRight, FiCheck, FiCreditCard, FiFileText, FiGrid, FiLock, FiX } from 'react-icons/fi';
import { getContrastColor, normalizeColor } from './previewUtils';
import './CommercePreviewUI.css';

// Ofertas fictícias: as prévias nunca consultam planos nem iniciam uma compra.
export const PREVIEW_PLANS = [
    { gb: 6, price: 29.9 }, { gb: 10, price: 34.9 }, { gb: 15, price: 39.9 },
    { gb: 23, price: 49.9 }, { gb: 45, price: 59.9 },
];
export const money = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;
export const previewAsset = (name) => `${process.env.PUBLIC_URL || ''}/preview-assets/${name}`;
export const productStyle = (color) => {
    const primary = normalizeColor(color);
    const foreground = getContrastColor(primary);
    return { '--product-primary': primary, '--product-on-primary': foreground,
        '--product-ink': foreground === '#ffffff' ? primary : '#111827' };
};

export const PreviewTag = () => <span className="commerce-preview-tag">Prévia do produto</span>;
export const PreviewField = ({ label, value = 'Preencha seus dados', wide = false }) => (
    <div className={`commerce-field ${wide ? 'commerce-field--wide' : ''}`}><span>{label}</span><div>{value}</div></div>
);
export const PreviewNotice = ({ message, onClose }) => message ? <div className="commerce-notice" role="status">
    <span>{message}</span><button type="button" onClick={onClose} aria-label="Fechar aviso da prévia"><FiX /></button>
</div> : null;

export const PaymentMethods = ({ value, onChange }) => <div className="commerce-payment-methods" role="group" aria-label="Forma de pagamento">
    {[['pix', 'PIX', FiGrid], ['cartao', 'Cartão de crédito', FiCreditCard], ['boleto', 'Boleto', FiFileText]].map(([id, title, Icon]) => (
        <button type="button" key={id} aria-pressed={value === id} onClick={() => onChange(id)}><Icon /><span>{title}</span>{value === id && <FiCheck />}</button>
    ))}
</div>;

export const PaymentPreview = ({ method, plan, onComplete }) => <div className="commerce-payment-example">
    {method === 'pix' ? <>
        <div className="commerce-pix-placeholder" aria-label="Espaço para QR Code na prévia"><FiGrid /><span>QR Code</span></div>
        <h3>Pagamento via PIX</h3><p>Visualize a disposição do QR Code e do código copia e cola.</p>
    </> : method === 'cartao' ? <>
        <h3>Dados do pagamento</h3><div className="commerce-fields">
            <PreviewField label="Nome no cartão" value="Nome do cliente" wide /><PreviewField label="Número do cartão" value="•••• •••• •••• ••••" wide />
            <PreviewField label="Validade" value="MM/AA" /><PreviewField label="CVV" value="•••" />
        </div>
    </> : <>
        <FiFileText className="commerce-payment-illustration" /><h3>Boleto bancário</h3>
        <div className="commerce-barcode" aria-hidden="true" /><p>O código de barras e o boleto ficam disponíveis nesta etapa.</p>
    </>}
    <strong className="commerce-payment-value">{money(plan.price)}</strong>
    <small><FiLock /> Prévia da etapa de pagamento.</small>
    <button type="button" className="commerce-primary-button" onClick={onComplete}>Ver confirmação <FiArrowRight /></button>
</div>;
