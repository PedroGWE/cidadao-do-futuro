/**
 * Validação de CPF/CNPJ com dígitos verificadores.
 * Armazene sempre apenas os números (use onlyDigits antes de persistir).
 */

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function allSameDigit(digits: string): boolean {
  return digits.split('').every((d) => d === digits[0])
}

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || allSameDigit(cpf)) return false

  for (const position of [9, 10]) {
    let sum = 0
    for (let i = 0; i < position; i++) sum += Number(cpf[i]) * (position + 1 - i)
    const check = ((sum * 10) % 11) % 10
    if (check !== Number(cpf[position])) return false
  }
  return true
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14 || allSameDigit(cnpj)) return false

  const weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  for (const position of [12, 13]) {
    let sum = 0
    const w = weights.slice(13 - position)
    for (let i = 0; i < position; i++) sum += Number(cnpj[i]) * w[i]
    const mod = sum % 11
    const check = mod < 2 ? 0 : 11 - mod
    if (check !== Number(cnpj[position])) return false
  }
  return true
}

/** Valida CPF (11 dígitos) ou CNPJ (14 dígitos) conforme o tamanho. */
export function isValidCpfCnpj(value: string): boolean {
  const digits = onlyDigits(value)
  if (digits.length === 11) return isValidCPF(digits)
  if (digits.length === 14) return isValidCNPJ(digits)
  return false
}

/** Máscara progressiva: alterna CPF/CNPJ automaticamente pelo tamanho. */
export function maskCpfCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14)
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
  }
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}
