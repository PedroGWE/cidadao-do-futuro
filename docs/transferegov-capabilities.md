# Transferegov: cobertura e limites

Atualizado em 7 de outubro de 2026. A integração é de consulta; não envia propostas, documentos, prestações de contas, assinaturas ou pagamentos ao governo.

## Fontes verificadas

| Conjunto | Fonte / recurso confirmado | Dados e relacionamento usados | Validação e limites |
|---|---|---|---|
| Gestão de Parcerias — programas | `GET https://api-publica.transferegov.gestao.gov.br/parcerias/programa` | `id_programa`, `nm_programa`; nome relacionado pelo ID do programa, nunca pelo título do projeto | Consulta ao vivo e OpenAPI; paginação `pagina`/`tamanho_da_pagina`. |
| Gestão de Parcerias — propostas | `GET https://api-publica.transferegov.gestao.gov.br/parcerias/proposta` | IDs da proposta/programa, CNPJ/nome do recebedor, objeto, situação, valores e datas publicados | Consulta ao vivo e OpenAPI. Filtro CNPJ `cnpj_ente_recebedor`; não há garantia de que toda organização possua registros. |
| Gestão de Parcerias — parcerias | recurso `parceria` no OpenAPI de `/parcerias` | Vínculo via ID oficial de proposta; números e dados do instrumento quando publicados | Esquema documentado; a consulta de todos os casos e cobertura de cada campo não foram exaustivamente validadas ao vivo. |
| Atualização da API de Parcerias | `GET https://api-publica.transferegov.gestao.gov.br/parcerias/data-atualizacao` | Data de atualização da fonte | Consulta ao vivo retornou data de atualização de 6/10/2026. Falha deste recurso não invalida registros obtidos. |
| Discricionárias e Legais (base histórica SICONV) | Listagem pública `GET https://api-publica.transferegov.gestao.gov.br/downloads/dadosgov/?restype=container&comp=list`; arquivos `siconv_proponentes.zip`, `siconv_proposta.zip`, `siconv_convenio.zip` no mesmo container | Proponente ↔ proposta por `ID_PROPONENTE`; proposta ↔ convênio por `ID_PROPOSTA`; arquivos são processados em streaming | Listagem e nomes/tamanhos foram observados ao vivo em 7/10/2026. O arquivo de proponentes foi baixado e seu CSV interno confirmado. O código valida cabeçalhos exigidos; a base completa não é baixada para abrir a tela. Frequência de publicação não é assumida como SLA. |
| Transferências Especiais | Portal público e comunicado oficial listam API/documentação | Não implementado neste adaptador | Disponibilidade do portal/documentação não basta para confirmar filtros, esquema, relacionamento e cobertura para esta integração; requer validação específica. |
| Fundo a Fundo e TED | Listados no portal/documentação oficial | Não implementados | A existência de documentação/planejamento não foi tratada como prova de disponibilidade operacional nem de acesso anônimo. |
| Obrasgov | `https://api-publica.obrasgov.gestao.gov.br/` | Nenhum dado ingerido | Endpoint/esquema e vínculo válido com projetos da instituição não foram confirmados nesta implementação. Não associamos obras apenas por município. |

Referências oficiais: [portal de APIs públicas](https://api-publica.transferegov.gestao.gov.br/), [OpenAPI de Gestão de Parcerias](https://api-publica.transferegov.gestao.gov.br/parcerias/docs), [downloads públicos](https://api-publica.transferegov.gestao.gov.br/downloads), [catálogo de APIs Transferegov](https://www.gov.br/transferegov/pt-br/sobre/apis-integracao) e [Comunicado 23/2026](https://www.gov.br/transferegov/pt-br/comunicados/comunicados-gerais/2026/comunicado-no-23-2026-do-portal-do-transferegov.br). O comunicado informou o encerramento do repositório antigo em 31/08/2026; por isso, os downloads não usam `repositorio.dados.gov.br/seges/detru`.

## Interpretação dos dados

- Valor global, repasse pactuado e contrapartida são campos distintos. Não representam saldo, dinheiro recebido, empenho ou pagamento.
- O nome de programa é resolvido pelo `id_programa` publicado. Se não houver relacionamento, permanece ausente.
- Proposta e instrumento permanecem registros distintos. Só se relacionam por identificador oficial; títulos semelhantes não criam vínculo.
- CNPJ é preservado como texto. Identificadores externos incluem fonte, módulo e tipo de entidade.
- Uma importação conserva o projeto já associado. A troca para outro projeto só ocorre por seleção explícita do usuário.
- Dados brutos e data de referência/coleta sustentam auditoria. Uma falha de fonte deve ser tratada como coleta parcial, não como confirmação de ausência de registros.

## Operação e recuperação

Configure `TRANSFEREGOV_API_URL` para a raiz oficial e defina `TRANSFEREGOV_TIMEOUT_MS` conforme a rede. A autenticação por `chave-api-dados` pertence ao módulo Portal da Transparência da CGU, não ao client do Transferegov. Para a CGU, injete `PORTAL_TRANSPARENCIA_TOKEN` no ambiente da API; não salve o valor no repositório nem em logs. Se uma fonte estiver indisponível, consulte o histórico da execução, corrija a conectividade e execute nova sincronização. Não apague registros para forçar atualização: os registros existentes são atualizados pela chave oficial e o vínculo de projeto é preservado.

Os arquivos CSV são grandes e sujeitos a publicação/substituição pelo operador da fonte. Validação de esquema rejeita arquivos incompatíveis; erro de um arquivo não deve apagar registros já válidos obtidos de outra fonte. Uma sincronização parcial deve ser revisada antes de interpretar registros não vistos como removidos.

## Cobertura ainda não entregue

Metas/etapas, eventos financeiros detalhados, aditivos, documentos, prestação de contas, alertas, painel detalhado por projeto e uma fila durável de jobs exigem fontes/relacionamentos adicionais e evolução de esquema/infraestrutura. Não são apresentados como cobertos por esta integração. O worker atual ainda depende do processo da API; para recuperação resiliente após reinício, é necessária adoção efetiva de fila persistente (Redis/BullMQ ou mecanismo equivalente).
