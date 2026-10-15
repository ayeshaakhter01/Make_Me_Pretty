import { useState } from 'react'
import { card, td, th } from './adminHelpers.js'

const ROLES = ['Customer', 'Admin', 'Delivery Partner']

/* USERS: see every account and change its role (Customer / Admin / Delivery Partner). */
export default function UsersPanel({ users, setUsers }) {
  const [search, setSearch] = useState('')
  const text = search.trim().toLowerCase()
  const visible = users.filter((u) => !text || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(text))

  const setRole = (id, role) => setUsers((current) => current.map((u) => (u.id === id ? { ...u, role } : u)))
  const remove = (user) => {
    if (window.confirm(`Remove ${user.name}?`)) setUsers((current) => current.filter((u) => u.id !== user.id))
  }

  return (
    <div>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." className="mb-4 !w-full sm:!w-80" />
      <div className={`overflow-x-auto ${card}`}>
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              {   ['Name', 'Email', 'Phone', 'Address', 'Role', 'Joined', 'Orders', ''].map((heading) => <th key={heading} className={th}>{heading}</th>)}
            </tr>
          </thead>
          <tbody>
            {visible.map((user) => (
              <tr key={user.id}>
                <td className={`${td} font-semibold`}>{user.name}</td>
                <td className={`${td} text-ink-soft`}>{user.email}</td>
                <td className={`${td} text-ink-soft`}>{user.phone || '—'}</td>
                <td className={`${td} max-w-[220px] text-ink-soft`}>{user.address || '—'}</td>
                <td className={td}>
                  <select value={user.role} onChange={(event) => setRole(user.id, event.target.value)} className="!w-auto !py-2 text-[13px]" aria-label={`Role for ${user.name}`}>
                    {ROLES.map((role) => <option key={role}>{role}</option>)}
                  </select>
                </td>
                <td className={`${td} text-ink-soft`}>{user.joined}</td>
                <td className={td}>{user.orders}</td>
                <td className={td}><button type="button" onClick={() => remove(user)} className="text-xs text-ink-soft underline hover:text-rose">Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
