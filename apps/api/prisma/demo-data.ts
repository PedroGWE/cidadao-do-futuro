import type { PrismaClient } from '@prisma/client'

const date = (value: string) => new Date(`${value}T12:00:00.000Z`)

export async function seedDemoData(prisma: PrismaClient, tenantId: string, adminId: string) {
  await prisma.organizationProfile.upsert({
    where: { tenant_id: tenantId },
    create: {
      tenant_id: tenantId,
      nome_organizacao: 'Instituto Semeando o Futuro',
      tipo_organizacao: 'INSTITUTO',
      tipo_documento: 'CNPJ',
      documento: '00000000000191',
      abrangencia: 'MUNICIPAL',
      areas_atuacao: ['Educação', 'Cultura', 'Esporte', 'Assistência Social'],
      municipio: 'São Paulo', uf: 'SP', telefone: '(11) 4000-2026',
      email: 'contato@semeando-futuro.demo',
    },
    update: {
      nome_organizacao: 'Instituto Semeando o Futuro',
      areas_atuacao: ['Educação', 'Cultura', 'Esporte', 'Assistência Social'],
      municipio: 'São Paulo', uf: 'SP',
    },
  })

  const projectSpecs = [
    { code: 'EDU-2026', name: 'Futuro em Movimento', description: 'Reforço escolar, inclusão digital e desenvolvimento socioemocional para crianças e adolescentes.', type: 'EDUCACIONAL' as const, status: 'EM_EXECUCAO' as const, start: '2026-02-02', end: '2026-12-18', total: '285000.00', approved: '250000.00', tags: ['educação', 'tecnologia', 'juventude'] },
    { code: 'CUL-2026', name: 'Cores da Comunidade', description: 'Oficinas de música, teatro e artes visuais com mostra cultural aberta à comunidade.', type: 'CULTURAL' as const, status: 'APROVADO' as const, start: '2026-03-09', end: '2026-11-30', total: '168500.00', approved: '168500.00', tags: ['cultura', 'arte', 'comunidade'] },
    { code: 'ESP-2025', name: 'Esporte que Transforma', description: 'Práticas esportivas e acompanhamento familiar para promoção de saúde e convivência.', type: 'ESPORTIVO' as const, status: 'CONCLUIDO' as const, start: '2025-02-10', end: '2025-12-12', total: '142000.00', approved: '142000.00', tags: ['esporte', 'saúde', 'convivência'] },
  ]
  const projects = []
  for (const spec of projectSpecs) {
    const project = await prisma.project.upsert({
      where: { tenant_id_code: { tenant_id: tenantId, code: spec.code } },
      create: {
        tenant_id: tenantId, code: spec.code, name: spec.name, description: spec.description,
        type: spec.type, status: spec.status, start_date: date(spec.start), end_date: date(spec.end),
        total_budget: spec.total, approved_budget: spec.approved, tags: spec.tags,
        manager_id: adminId, created_by: adminId,
      },
      update: { status: spec.status, manager_id: adminId },
    })
    projects.push(project)
    await prisma.projectMember.upsert({
      where: { project_id_user_id: { project_id: project.id, user_id: adminId } },
      create: { project_id: project.id, user_id: adminId, role: 'GESTOR' },
      update: { role: 'GESTOR' },
    })
  }

  const educationProject = projects[0]
  const phases = [
    ['Mobilização e matrículas', 1, 'CONCLUIDA'],
    ['Ciclo de oficinas', 2, 'EM_ANDAMENTO'],
    ['Mostra de resultados', 3, 'NAO_INICIADA'],
  ] as const
  for (const [name, order, status] of phases) {
    if (!await prisma.projectPhase.findFirst({ where: { project_id: educationProject.id, name } })) {
      await prisma.projectPhase.create({ data: { project_id: educationProject.id, name, order, status } })
    }
  }
  const activePhase = await prisma.projectPhase.findFirst({ where: { project_id: educationProject.id, name: 'Ciclo de oficinas' } })
  const tasks = [
    ['Organizar calendário das oficinas', 'CONCLUIDA', 'ALTA', '2026-03-06'],
    ['Realizar reunião com responsáveis', 'EM_ANDAMENTO', 'MEDIA', '2026-10-16'],
    ['Consolidar indicadores do trimestre', 'PENDENTE', 'URGENTE', '2026-10-09'],
  ] as const
  for (const [title, status, priority, dueDate] of tasks) {
    if (!await prisma.projectTask.findFirst({ where: { project_id: educationProject.id, title } })) {
      await prisma.projectTask.create({ data: { project_id: educationProject.id, phase_id: activePhase?.id, title, status, priority, due_date: date(dueDate), assigned_to: adminId } })
    }
  }

  const beneficiarySpecs = [
    ['90000000001', 'Ana Clara Souza', '2013-05-14', 'FEMININO', 'PARDA', 'Turma Horizonte', 'Tarde', '7º ano', 'Mariana Souza'],
    ['90000000002', 'Lucas Gabriel Lima', '2012-09-22', 'MASCULINO', 'PRETA', 'Turma Horizonte', 'Tarde', '8º ano', 'Carla Lima'],
    ['90000000003', 'Sofia Oliveira Santos', '2014-01-08', 'FEMININO', 'BRANCA', 'Turma Sementes', 'Manhã', '6º ano', 'Renata Oliveira'],
    ['90000000004', 'Miguel Henrique Costa', '2013-11-30', 'MASCULINO', 'PARDA', 'Turma Sementes', 'Manhã', '7º ano', 'Juliana Costa'],
    ['90000000005', 'Beatriz Alves Rocha', '2012-07-19', 'FEMININO', 'PRETA', 'Turma Horizonte', 'Tarde', '8º ano', 'Patrícia Alves'],
    ['90000000006', 'Rafael Martins Nunes', '2014-03-27', 'MASCULINO', 'BRANCA', 'Turma Sementes', 'Manhã', '6º ano', 'Eduardo Nunes'],
  ] as const
  const beneficiaries = []
  for (const [cpf, name, birth, gender, race, turma, turno, serie, guardianName] of beneficiarySpecs) {
    const beneficiary = await prisma.beneficiary.upsert({
      where: { tenant_id_cpf: { tenant_id: tenantId, cpf } },
      create: {
        tenant_id: tenantId, project_id: educationProject.id, name, cpf, birth_date: date(birth), gender, race,
        status: 'ATIVO', enrollment_date: date('2026-02-09'), telefone: '(11) 98888-2026',
        cidade: 'São Paulo', uf_endereco: 'SP', bairro: 'Jardim Esperança', turma, turno,
        escola: 'EMEF Caminhos do Saber', serie_ano: serie, renda_familiar: '2350.00', pessoas_residencia: 4,
        termo_consentimento: true, data_consentimento: date('2026-02-09'), autorizacao_uso_imagem: true,
        created_by: adminId,
      },
      update: { project_id: educationProject.id, status: 'ATIVO', turma, turno },
    })
    beneficiaries.push(beneficiary)
    await prisma.beneficiarioProjeto.upsert({
      where: { beneficiary_id_project_id: { beneficiary_id: beneficiary.id, project_id: educationProject.id } },
      create: { beneficiary_id: beneficiary.id, project_id: educationProject.id, data_ingresso: date('2026-02-09'), turma, turno },
      update: { status: 'ATIVO', turma, turno },
    })
    if (!await prisma.responsavel.findFirst({ where: { beneficiary_id: beneficiary.id, nome_completo: guardianName } })) {
      await prisma.responsavel.create({ data: { beneficiary_id: beneficiary.id, nome_completo: guardianName, parentesco: guardianName === 'Eduardo Nunes' ? 'PAI' : 'MAE', telefone: '(11) 98888-3030' } })
    }
  }

  const professorSpecs = [
    ['80000000001', 'Helena Ribeiro', 'helena.ribeiro@semeando-futuro.demo', ['Língua Portuguesa', 'Produção Textual'], 'CLT', 'TRANSFERENCIA', '4800.00'],
    ['80000000002', 'André Carvalho', 'andre.carvalho@semeando-futuro.demo', ['Matemática', 'Robótica'], 'AUTONOMO_PJ', 'PIX', '4200.00'],
    ['80000000003', 'Camila Fernandes', 'camila.fernandes@semeando-futuro.demo', ['Artes', 'Teatro'], 'PRESTADOR_SERVICO', 'PIX', '3600.00'],
  ] as const
  const professors = []
  for (const [cpf, nome, email, disciplinas, tipoVinculo, formaPagamento, salary] of professorSpecs) {
    const professor = await prisma.professor.upsert({
      where: { tenant_id_cpf: { tenant_id: tenantId, cpf } },
      create: {
        tenant_id: tenantId, nome_completo: nome, cpf, telefone: '(11) 97777-2026', email,
        cidade: 'São Paulo', uf: 'SP', formacao_academica: 'Licenciatura completa',
        especializacao: 'Educação e práticas inclusivas', disciplinas: [...disciplinas], tipo_vinculo: tipoVinculo,
        forma_pagamento: formaPagamento, dia_pagamento: 5, status: 'ATIVO', data_admissao: date('2026-01-20'), created_by: adminId,
      },
      update: { status: 'ATIVO', disciplinas: [...disciplinas] },
    })
    professors.push(professor)
    await prisma.professorProjeto.upsert({
      where: { professor_id_project_id: { professor_id: professor.id, project_id: educationProject.id } },
      create: { professor_id: professor.id, project_id: educationProject.id, data_inicio: date('2026-02-02'), carga_horaria_semanal: 20, dias_horarios: { segunda: '13:30-17:30', quarta: '13:30-17:30' } },
      update: { status: 'ATIVO', carga_horaria_semanal: 20 },
    })
    if (!await prisma.historicoProfessor.findFirst({ where: { professor_id: professor.id, data_vigencia: date('2026-02-01') } })) {
      await prisma.historicoProfessor.create({ data: { professor_id: professor.id, valor_mensal: salary, data_vigencia: date('2026-02-01'), motivo: 'Contratação para o ciclo 2026', created_by: adminId } })
    }
  }

  const classes = [
    ['Turma Horizonte', professors[0].id, ['terça', 'quinta'], '14:00-17:00'],
    ['Turma Sementes', professors[1].id, ['segunda', 'quarta'], '09:00-12:00'],
  ] as const
  for (const [name, professorId, days, hours] of classes) {
    let turma = await prisma.turma.findFirst({ where: { tenant_id: tenantId, nome: name, deleted_at: null } })
    if (!turma) turma = await prisma.turma.create({ data: { tenant_id: tenantId, project_id: educationProject.id, professor_id: professorId, nome: name, horario: { dias: [...days], horario: hours } } })
    for (const student of beneficiaries.filter((item) => item.turma === name)) {
      const enrollment = await prisma.matricula.upsert({
        where: { turma_id_aluno_id: { turma_id: turma.id, aluno_id: student.id } },
        create: { tenant_id: tenantId, turma_id: turma.id, aluno_id: student.id }, update: { status: 'ATIVA' },
      })
      await prisma.presenca.upsert({
        where: { matricula_id_data: { matricula_id: enrollment.id, data: date('2026-10-01') } },
        create: { tenant_id: tenantId, turma_id: turma.id, matricula_id: enrollment.id, data: date('2026-10-01'), presente: true },
        update: { presente: true },
      })
    }
    if (!await prisma.atividade.findFirst({ where: { tenant_id: tenantId, turma_id: turma.id, titulo: 'Projeto de impacto no bairro' } })) {
      await prisma.atividade.create({ data: { tenant_id: tenantId, turma_id: turma.id, titulo: 'Projeto de impacto no bairro', descricao: 'Proposta colaborativa para melhorar um espaço de convivência da comunidade.', prazo: date('2026-10-30'), status: 'PUBLICADA' } })
    }
  }

  const costCenter = await prisma.costCenter.upsert({
    where: { tenant_id_code: { tenant_id: tenantId, code: 'CC-EDU-26' } },
    create: { tenant_id: tenantId, code: 'CC-EDU-26', name: 'Futuro em Movimento', type: 'PROJETO', project_id: educationProject.id },
    update: { project_id: educationProject.id },
  })
  const transactions = [
    ['REC-2026-001', 'RECEITA', 'PAGO', 'Primeira parcela do termo de fomento', '125000.00', '2026-02-12', 'Repasse público'],
    ['REC-2026-002', 'RECEITA', 'PAGO', 'Patrocínio empresarial — ciclo de oficinas', '45000.00', '2026-04-05', 'Patrocínio'],
    ['DES-2026-001', 'DESPESA', 'PAGO', 'Equipe pedagógica — setembro', '22800.00', '2026-09-05', 'Recursos humanos'],
    ['DES-2026-002', 'DESPESA', 'PAGO', 'Aquisição de notebooks educacionais', '18450.00', '2026-08-18', 'Equipamentos'],
    ['DES-2026-003', 'DESPESA', 'APROVADO', 'Materiais para oficinas de outubro', '6720.00', '2026-10-02', 'Material pedagógico'],
    ['DES-2026-004', 'DESPESA', 'PENDENTE', 'Transporte para visita cultural', '3850.00', '2026-10-20', 'Transporte'],
  ] as const
  for (const [reference, type, status, description, amount, transactionDate, category] of transactions) {
    if (!await prisma.transaction.findFirst({ where: { tenant_id: tenantId, reference_number: reference } })) {
      await prisma.transaction.create({ data: { tenant_id: tenantId, project_id: educationProject.id, cost_center_id: costCenter.id, type, status, description, amount, date: date(transactionDate), paid_at: status === 'PAGO' ? date(transactionDate) : undefined, payment_method: 'TRANSFERÊNCIA BANCÁRIA', reference_number: reference, category, created_by: adminId, approved_by: status !== 'PENDENTE' ? adminId : undefined } })
    }
  }

  if (!await prisma.budget.findFirst({ where: { tenant_id: tenantId, project_id: educationProject.id, fiscal_year: 2026 } })) {
    await prisma.budget.create({ data: {
      tenant_id: tenantId, project_id: educationProject.id, fiscal_year: 2026, total_amount: '250000.00', allocated: '250000.00', committed: '142000.00', spent: '47970.00', balance: '202030.00',
      categories: { create: [
        { name: 'Recursos humanos', code: 'RH', planned_amount: '132000.00', committed_amount: '110000.00', spent_amount: '22800.00' },
        { name: 'Materiais e equipamentos', code: 'MAT', planned_amount: '68000.00', committed_amount: '25200.00', spent_amount: '25170.00' },
        { name: 'Atividades e transporte', code: 'ATV', planned_amount: '50000.00', committed_amount: '6800.00', spent_amount: '0.00' },
      ] },
    } })
  }

  const editais = [
    ['DEMO-ED-001', 'Programa Educação e Tecnologia 2027', 'Fundação Horizonte', '2026-11-20', 'EM_PREPARACAO', 'Documentação institucional revisada; orçamento em elaboração.'],
    ['DEMO-ED-002', 'Fundo Municipal da Criança e do Adolescente', 'CMDCA São Paulo', '2026-12-05', 'SALVO', 'Avaliar aderência ao eixo de fortalecimento de vínculos.'],
    ['DEMO-ED-003', 'Prêmio Comunidades Criativas', 'Instituto Cultura Viva', '2026-09-15', 'INSCRITO', 'Proposta Cores da Comunidade enviada em 12/09.'],
  ] as const
  for (const [ref, title, org, close, status, notes] of editais) {
    await prisma.savedEdital.upsert({
      where: { tenant_id_edital_ref: { tenant_id: tenantId, edital_ref: ref } },
      create: { tenant_id: tenantId, edital_ref: ref, fonte: 'MANUAL', titulo: title, orgao: org, data_encerramento: date(close), status, notas: notes },
      update: { status, notas: notes },
    })
  }

  if (!await prisma.accountabilityReport.findFirst({ where: { tenant_id: tenantId, title: 'Relatório Parcial — 1º semestre de 2026' } })) {
    await prisma.accountabilityReport.create({ data: { tenant_id: tenantId, project_id: educationProject.id, title: 'Relatório Parcial — 1º semestre de 2026', period_start: date('2026-02-01'), period_end: date('2026-06-30'), type: 'PARCIAL', status: 'APROVADO', total_received: '170000.00', total_spent: '47970.00', balance: '122030.00', submitted_at: date('2026-07-15'), approved_at: date('2026-08-04'), created_by: adminId } })
  }

  const partnerSpecs = [
    { name: 'Fundação Horizonte', type: 'OUTRO_OSC' as const, status: 'ATIVO' as const, email: 'projetos@fundacaohorizonte.demo', phone: '(11) 4002-1010', tags: ['educação', 'tecnologia'], notes: 'Parceira estratégica no fortalecimento pedagógico.' },
    { name: 'Tecnova Brasil', type: 'EMPRESA' as const, status: 'ATIVO' as const, email: 'impacto@tecnova.demo', phone: '(11) 4002-2020', tags: ['tecnologia', 'voluntariado'], notes: 'Apoio financeiro e mentoria de carreira.' },
    { name: 'Secretaria Municipal de Cultura', type: 'GOVERNO' as const, status: 'ATIVO' as const, email: 'parcerias@cultura.sp.demo', phone: '(11) 4002-3030', tags: ['cultura', 'território'], notes: 'Cooperação para uso de equipamentos culturais.' },
    { name: 'Rede Alimenta Bem', type: 'EMPRESA' as const, status: 'PROSPECTO' as const, email: 'social@alimentabem.demo', phone: '(11) 4002-4040', tags: ['alimentação', 'doação'], notes: 'Prospecção para apoio aos lanches das oficinas.' },
  ]
  const seededPartners = []
  for (const spec of partnerSpecs) {
    let partner = await prisma.partner.findFirst({ where: { tenant_id: tenantId, name: spec.name } })
    if (!partner) partner = await prisma.partner.create({ data: { tenant_id: tenantId, ...spec } })
    else partner = await prisma.partner.update({ where: { id: partner.id }, data: { status: spec.status, email: spec.email, phone: spec.phone, tags: spec.tags, notes: spec.notes } })
    seededPartners.push(partner)
  }

  const partnershipSpecs = [
    { partner: seededPartners[0], project: educationProject, type: 'PATROCINIO' as const, status: 'ATIVO' as const, value: '45000.00', inKind: '8000.00', description: 'Financiamento do laboratório de tecnologia e formação de educadores.', start: '2026-02-01', end: '2026-12-18' },
    { partner: seededPartners[1], project: educationProject, type: 'VOLUNTARIADO' as const, status: 'ATIVO' as const, value: '0.00', inKind: '18000.00', description: 'Mentorias mensais e doação de equipamentos recondicionados.', start: '2026-03-01', end: '2026-11-30' },
    { partner: seededPartners[2], project: projects[1], type: 'PARCERIA_TECNICA' as const, status: 'ATIVO' as const, value: '25000.00', inKind: '12000.00', description: 'Cessão de espaços culturais e apoio à mostra de encerramento.', start: '2026-03-09', end: '2026-11-30' },
    { partner: seededPartners[3], project: educationProject, type: 'DOACAO' as const, status: 'PROPOSTA' as const, value: '15000.00', inKind: '0.00', description: 'Fornecimento de alimentação para os ciclos de oficinas.', start: '2026-10-15', end: '2027-06-30' },
  ]
  for (const spec of partnershipSpecs) {
    const existing = await prisma.partnership.findFirst({ where: { tenant_id: tenantId, partner_id: spec.partner.id, project_id: spec.project.id, type: spec.type } })
    if (!existing) {
      await prisma.partnership.create({ data: { tenant_id: tenantId, partner_id: spec.partner.id, project_id: spec.project.id, type: spec.type, status: spec.status, value: spec.value, in_kind_value: spec.inKind, description: spec.description, start_date: date(spec.start), end_date: date(spec.end) } })
    }
  }

  console.log('   Dados fictícios de apresentação criados/atualizados')
}
