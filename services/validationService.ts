
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;

  const calculateDigit = (slice: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i]) * (factor - i);
    }
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };

  const dv1 = calculateDigit(cleanCPF.substring(0, 9), 10);
  const dv2 = calculateDigit(cleanCPF.substring(0, 10), 11);

  return dv1 === parseInt(cleanCPF[9]) && dv2 === parseInt(cleanCPF[10]);
};

export const validateCNS = (cns: string): boolean => {
  const cleanCNS = cns.replace(/\D/g, '');
  if (cleanCNS.length !== 15) return false;

  // Regra solicitada: deve começar com 1, 2, 7, 8 ou 9
  const firstDigit = cleanCNS[0];
  if (!['1', '2', '7', '8', '9'].includes(firstDigit)) return false;

  // Algoritmo de soma ponderada para CNS (Modulo 11)
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    sum += parseInt(cleanCNS[i]) * (15 - i);
  }

  return sum % 11 === 0;
};

export const applyCadSusMask = (value: string): string => {
  const v = value.replace(/\D/g, '').substring(0, 15);

  if (v.length <= 11) {
    // Máscara CPF
    return v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  } else {
    // Máscara CNS
    return v
      .replace(/(\d{3})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2');
  }
};

export const applyPhoneMask = (value: string): string => {
  const v = value.replace(/\D/g, '').substring(0, 11);
  return v
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

export const validateMobilePhone = (phone: string): { isValid: boolean, formatted?: string } => {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length !== 11) {
    return { isValid: false };
  }

  // O terceiro dígito deve ser obrigatoriamente 9
  if (cleanPhone[2] !== '9') {
    return { isValid: false };
  }

  const formatted = cleanPhone
    .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

  return { isValid: true, formatted };
};
export const applyProcedureMask = (value: string): string => {
  const v = value.replace(/\D/g, '').substring(0, 10);
  return v
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})/, '$1-$2');
};
