import {
  isValidCNPJ,
  isValidCPF,
  isValidCpfCnpj,
  maskCpfCnpj,
  onlyDigits,
} from '@cidadao/shared'

describe('onlyDigits', () => {
  it('remove máscara e caracteres não numéricos', () => {
    expect(onlyDigits('529.982.247-25')).toBe('52998224725')
    expect(onlyDigits('11.222.333/0001-81')).toBe('11222333000181')
  })
})

describe('isValidCPF', () => {
  it.each(['52998224725', '529.982.247-25', '11144477735'])('aceita CPF válido %s', (cpf) => {
    expect(isValidCPF(cpf)).toBe(true)
  })

  it.each([
    '52998224724', // dígito verificador errado
    '11144477734', // dígito verificador errado
    '00000000000', // todos iguais
    '11111111111', // todos iguais
    '1234567890', // 10 dígitos
    '123456789012', // 12 dígitos
    '',
  ])('rejeita CPF inválido %s', (cpf) => {
    expect(isValidCPF(cpf)).toBe(false)
  })
})

describe('isValidCNPJ', () => {
  it.each(['11222333000181', '11.222.333/0001-81', '11444777000161'])(
    'aceita CNPJ válido %s',
    (cnpj) => {
      expect(isValidCNPJ(cnpj)).toBe(true)
    },
  )

  it.each([
    '11222333000180', // dígito verificador errado
    '11444777000160', // dígito verificador errado
    '00000000000000', // todos iguais
    '1122233300018', // 13 dígitos
    '',
  ])('rejeita CNPJ inválido %s', (cnpj) => {
    expect(isValidCNPJ(cnpj)).toBe(false)
  })
})

describe('isValidCpfCnpj', () => {
  it('decide pelo tamanho: 11 → CPF, 14 → CNPJ', () => {
    expect(isValidCpfCnpj('529.982.247-25')).toBe(true)
    expect(isValidCpfCnpj('11.222.333/0001-81')).toBe(true)
    expect(isValidCpfCnpj('123')).toBe(false)
  })
})

describe('maskCpfCnpj', () => {
  it('formata CPF e CNPJ progressivamente pelo tamanho', () => {
    expect(maskCpfCnpj('52998224725')).toBe('529.982.247-25')
    expect(maskCpfCnpj('11222333000181')).toBe('11.222.333/0001-81')
    expect(maskCpfCnpj('529982')).toBe('529.982')
  })
})
