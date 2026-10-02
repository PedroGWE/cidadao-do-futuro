import { GetServerSideProps } from 'next'
import { FormEvent, useEffect, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { Building2, KeyRound, Mail, Shield, UserCircle, Users } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Tenant { id: string; name: string; slug: string; cnpj?: string; type: string }
interface User { id: string; name: string; email: string; status: string; user_roles: Array<{ role: { name: string } }> }
interface Role { id: string; name: string; permissions?: string[]; is_system?: boolean }
interface Me { id: string; name: string; email: string; phone?: string }

export default function ConfiguracoesPage() {
  const { mutate } = useSWRConfig()
  const { logout } = useAuth()
  const { data: tenant, error: tenantError } = useSWR<Tenant>('/tenants/me', (url: string) => api.get(url).then((r) => r.data))
  const { data: users, error: usersError } = useSWR<User[]>('/users', (url: string) => api.get(url).then((r) => r.data))
  const { data: roles } = useSWR<Role[]>('/tenants/me/roles', (url: string) => api.get(url).then((r) => r.data))
  const { data: me } = useSWR<Me>('/users/me', (url: string) => api.get(url).then((r) => r.data))
  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [roleId, setRoleId] = useState('')
  const [message, setMessage] = useState('')
  const [profileName, setProfileName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [roleName, setRoleName] = useState('')
  const [rolePermissions, setRolePermissions] = useState('projects:read')

  useEffect(() => {
    if (tenant) { setName(tenant.name); setCnpj(tenant.cnpj ?? '') }
  }, [tenant])
  useEffect(() => { if (me) { setProfileName(me.name); setPhone(me.phone ?? '') } }, [me])

  async function saveProfile(event: FormEvent) {
    event.preventDefault(); setMessage('')
    await api.patch('/users/me', { name: profileName, ...(phone && { phone }) })
    await mutate('/users/me'); setMessage('Perfil atualizado.')
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault(); setMessage('')
    await api.patch('/users/me/password', { current_password: currentPassword, new_password: newPassword })
    setMessage('Senha alterada. Entre novamente.'); await logout()
  }

  async function createRole(event: FormEvent) {
    event.preventDefault(); setMessage('')
    const permissions = rolePermissions.split(',').map((item) => item.trim()).filter(Boolean)
    await api.post('/tenants/me/roles', { name: roleName, permissions })
    setRoleName(''); await mutate('/tenants/me/roles'); setMessage('Papel criado.')
  }

  async function setUserRole(userId: string, selectedRoleId: string) {
    await api.put(`/users/${userId}/roles`, { role_ids: selectedRoleId ? [selectedRoleId] : [] })
    await mutate('/users'); setMessage('Acesso do usuário atualizado.')
  }

  async function deactivateUser(userId: string) {
    if (!window.confirm('Desativar este usuário e encerrar suas sessões?')) return
    await api.delete(`/users/${userId}`); await mutate('/users'); setMessage('Usuário desativado.')
  }

  async function saveOrganization(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    await api.patch('/tenants/me', { name, ...(cnpj && { cnpj }) })
    await mutate('/tenants/me')
    setMessage('Dados da organização salvos.')
  }

  async function invite(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    await api.post('/tenants/me/invites', { email: inviteEmail, ...(roleId && { roleId }) })
    setInviteEmail('')
    setMessage('Convite criado. Consulte a lista de convites para acompanhar o aceite.')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-xl font-semibold text-gray-900">Configurações</h1><p className="text-sm text-gray-500">Organização, usuários e acessos.</p></div>
        {message && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
        {(tenantError || usersError) && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Você não possui acesso ou os dados não puderam ser carregados.</div>}

        <form className="card space-y-4" onSubmit={saveProfile}>
          <h2 className="flex items-center gap-2 font-semibold text-gray-900"><UserCircle className="h-4 w-4" /> Meu perfil</h2>
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Nome<input className="input mt-1 w-full" value={profileName} onChange={(e) => setProfileName(e.target.value)} required minLength={2} /></label><label className="text-sm">Telefone<input className="input mt-1 w-full" value={phone} onChange={(e) => setPhone(e.target.value)} /></label></div>
          <button className="btn-primary">Salvar perfil</button>
        </form>

        <form className="card space-y-4" onSubmit={changePassword}>
          <h2 className="flex items-center gap-2 font-semibold text-gray-900"><KeyRound className="h-4 w-4" /> Trocar senha</h2>
          <div className="grid gap-4 sm:grid-cols-2"><input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Senha atual" required minLength={8} /><input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha (12 caracteres)" required minLength={12} /></div>
          <button className="btn-primary">Alterar senha</button>
        </form>

        <form className="card space-y-4" onSubmit={saveOrganization}>
          <h2 className="flex items-center gap-2 font-semibold text-gray-900"><Building2 className="h-4 w-4" /> Organização</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-gray-700">Nome<input className="input mt-1 w-full" value={name} onChange={(e) => setName(e.target.value)} required /></label>
            <label className="text-sm text-gray-700">CNPJ<input className="input mt-1 w-full" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="Somente números" /></label>
          </div>
          <button className="btn-primary" type="submit">Salvar organização</button>
        </form>

        <form className="card space-y-4" onSubmit={invite}>
          <h2 className="flex items-center gap-2 font-semibold text-gray-900"><Mail className="h-4 w-4" /> Convidar usuário</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="usuario@exemplo.org" required />
            <select className="input" value={roleId} onChange={(e) => setRoleId(e.target.value)}><option value="">Sem papel inicial</option>{roles?.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>
          </div>
          <button className="btn-primary" type="submit">Gerar convite</button>
        </form>

        <form className="card space-y-4" onSubmit={createRole}>
          <h2 className="flex items-center gap-2 font-semibold text-gray-900"><Shield className="h-4 w-4" /> Criar papel de acesso</h2>
          <div className="grid gap-4 sm:grid-cols-2"><input className="input" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="Nome do papel" required minLength={2} /><input className="input" value={rolePermissions} onChange={(e) => setRolePermissions(e.target.value)} placeholder="projects:read, reports:read" required /></div>
          <p className="text-xs text-gray-500">Informe permissões separadas por vírgula. A permissão global * é reservada.</p><button className="btn-primary">Criar papel</button>
        </form>

        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900"><Users className="h-4 w-4" /> Usuários</h2>
          {!users ? <p className="text-sm text-gray-500">Carregando...</p> : users.length === 0 ? <p className="text-sm text-gray-500">Nenhum usuário.</p> : (
            <div className="divide-y divide-gray-100">{users.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium text-gray-900">{user.name}</p><p className="text-xs text-gray-500">{user.email} · {user.status}</p></div><div className="flex items-center gap-2"><select aria-label={`Papel de ${user.name}`} className="input text-sm" value={user.user_roles[0]?.role.name ? roles?.find((role) => role.name === user.user_roles[0].role.name)?.id ?? '' : ''} onChange={(e) => setUserRole(user.id, e.target.value)} disabled={user.status !== 'ACTIVE'}><option value="">Sem papel</option>{roles?.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>{user.id !== me?.id && user.status === 'ACTIVE' && <button type="button" onClick={() => deactivateUser(user.id)} className="text-xs text-red-600">Desativar</button>}</div></div>)}</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.req.cookies['refresh_token']) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
