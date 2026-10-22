import { filterBrands, normalizeBrandName, resolveBrandSelection } from './brandSearch';

const netcel = Object.freeze({ id: 617, name: 'Netcel' });
const netcom = Object.freeze({ id: 83, name: 'Netcom' });

test('normaliza acentos, caixa, espaços e pontuação sem alterar o nome original', () => {
    expect(normalizeBrandName('  SÃO-José / Telecom.  ')).toBe('sao jose telecom');
    expect(normalizeBrandName('São\tJosé   Telecom')).toBe('sao jose telecom');
    expect(normalizeBrandName(null)).toBe('');
});

test('lista vazia de consulta conserva os objetos e a ordem recebida do ERP', () => {
    const brands = Object.freeze([netcom, netcel]);
    const result = filterBrands(brands, '  ');
    expect(result).toEqual([netcom, netcel]);
    expect(result[0]).toBe(netcom);
    expect(result[1]).toBe(netcel);
    expect(result).not.toBe(brands);
});

test('ordena exato, prefixo, contém e fuzzy, preservando a ordem dentro da faixa', () => {
    const contains = { id: 1, name: 'Rede Netcel Sul' };
    const prefix = { id: 2, name: 'NETCEL TELECOM' };
    const fuzzy = { id: 3, name: 'Netsel' };
    const secondPrefix = { id: 4, name: 'Netcel Brasil' };
    expect(filterBrands([contains, prefix, fuzzy, secondPrefix, netcel], 'netcel'))
        .toEqual([netcel, prefix, secondPrefix, contains, fuzzy]);
});

test('consulta com erro de uma edição encontra Netcel e o primeiro token do nome completo', () => {
    const fullName = { id: 58, name: 'NETCEL TELECOM' };
    expect(filterBrands([netcom, netcel, fullName], 'netcell')).toEqual([netcel, fullName]);
    expect(resolveBrandSelection([netcom, netcel], 'netcell')).toBe(netcel);
    expect(resolveBrandSelection([fullName], 'netcell')).toBe(fullName);
});

test.each(['metcel', 'netcl'])('aceita substituição e remoção de um caractere: %s', (query) => {
    expect(resolveBrandSelection([netcel], query)).toBe(netcel);
});

test('normalização de acento e caixa resolve o objeto original do ERP', () => {
    const brand = Object.freeze({ id: 944, name: 'São José Telecom' });
    expect(filterBrands([brand], 'SÃO JOSÉ')).toEqual([brand]);
    expect(resolveBrandSelection([brand], '  sao-jose TELECOM ')).toBe(brand);
});

test('um nome exato único tem prioridade sobre nomes mais longos', () => {
    expect(resolveBrandSelection([{ id: 4, name: 'Netcel Telecom' }, netcel], 'NETCEL')).toBe(netcel);
});

test('prefixo de três caracteres resolve apenas quando identifica uma marca', () => {
    expect(resolveBrandSelection([netcel], 'net')).toBe(netcel);
    expect(resolveBrandSelection([netcel], 'ne')).toBeNull();
    expect(resolveBrandSelection([netcel, netcom], 'netc')).toBeNull();
    expect(filterBrands([netcel, netcom], 'netc')).toEqual([netcel, netcom]);
});

test('nomes normalizados iguais com IDs diferentes continuam ambíguos', () => {
    const duplicateName = { id: 777, name: 'NETCEL.' };
    expect(resolveBrandSelection([netcel, duplicateName], 'netcel')).toBeNull();
    expect(resolveBrandSelection([netcel, duplicateName], 'netcell')).toBeNull();
    expect(resolveBrandSelection([netcel, duplicateName], 'net')).toBeNull();
});

test('dois candidatos fuzzy igualmente próximos não resolvem uma marca', () => {
    expect(resolveBrandSelection([netcel, { id: 11, name: 'Netcal' }], 'netcol')).toBeNull();
});

test('fuzzy exige quatro caracteres e não aceita duas edições', () => {
    const shortBrand = { id: 90, name: 'Abcd' };
    expect(filterBrands([shortBrand], 'abd')).toEqual([]);
    expect(resolveBrandSelection([shortBrand], 'abd')).toBeNull();
    expect(filterBrands([netcel], 'metcl')).toEqual([]);
    expect(resolveBrandSelection([netcel], 'metcl')).toBeNull();
});

test('consulta vazia, desconhecida ou sem catálogo não fabrica marca nem ID', () => {
    const brands = Object.freeze([netcel, netcom]);
    expect(resolveBrandSelection(brands, '')).toBeNull();
    expect(resolveBrandSelection(brands, 'Operadora inexistente')).toBeNull();
    expect(filterBrands(brands, 'Operadora inexistente')).toEqual([]);
    expect(resolveBrandSelection([], 'netcel')).toBeNull();
    expect(filterBrands([], 'netcel')).toEqual([]);
    expect(brands).toEqual([netcel, netcom]);
    expect(resolveBrandSelection(brands, 'netcell').id).toBe(617);
});
