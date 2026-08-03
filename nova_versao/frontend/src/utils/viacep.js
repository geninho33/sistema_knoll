/** Formata CEP como 00000-000 */
export function formatCep(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

/**
 * Consulta ViaCEP. Retorna null se inválido / não encontrado.
 * @returns {Promise<{logradouro:string,bairro:string,municipio:string,uf:string,complemento:string}|null>}
 */
export async function lookupCep(cep) {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.erro) return null;
  return {
    logradouro: data.logradouro || '',
    bairro: data.bairro || '',
    municipio: data.localidade || '',
    uf: data.uf || '',
    complemento: data.complemento || '',
  };
}
