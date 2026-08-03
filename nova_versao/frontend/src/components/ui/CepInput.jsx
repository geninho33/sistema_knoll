import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { formatCep, lookupCep, onlyDigits } from '../../utils/viacep';

/**
 * Input de CEP com busca ViaCEP.
 * onAddressFound({ logradouro, bairro, municipio, uf, complemento })
 */
export default function CepInput({
  id,
  label = 'CEP',
  value,
  onChange,
  onAddressFound,
  className = '',
  required = false,
}) {
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState('');

  const runLookup = async (raw) => {
    const digits = onlyDigits(raw);
    if (digits.length !== 8) {
      setHint('');
      return;
    }
    setLoading(true);
    setHint('');
    try {
      const addr = await lookupCep(digits);
      if (!addr) {
        setHint('CEP não encontrado');
        return;
      }
      setHint('Endereço preenchido');
      onAddressFound?.(addr);
    } catch {
      setHint('Falha ao consultar CEP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="postal-code"
          required={required}
          className="field-input pr-10"
          value={value}
          placeholder="00000-000"
          onChange={(e) => {
            const formatted = formatCep(e.target.value);
            onChange(formatted);
            setHint('');
            if (onlyDigits(formatted).length === 8) runLookup(formatted);
          }}
          onBlur={(e) => runLookup(e.target.value)}
        />
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500"
            size={18}
            aria-hidden="true"
          />
        )}
      </div>
      {hint && (
        <p className={`text-xs mt-1 ${hint.includes('preenchido') ? 'text-emerald-600' : 'text-amber-600'}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
