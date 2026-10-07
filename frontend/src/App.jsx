import { useEffect, useState, useRef } from 'react'
import './App.css'

const roles = [
  ['admin', 'Administrador'],
  ['doctor', 'Profesional médico'],
  ['nurse', 'Auxiliar de enfermería'],
  ['patient', 'Paciente'],
  ['receptionist', 'Recepción'],
  ['pharmacy', 'Farmacia']
]

const menus = {
  admin: [
    ['overview', 'Panel general', 'chart'],
    ['users', 'Usuarios', 'users'],
    ['specialties', 'Especialidades', 'activity'],
    ['schedules', 'Horarios', 'calendar']
  ],
  doctor: [
    ['overview', 'Mi agenda', 'calendar'],
    ['history', 'Historia clínica', 'activity'],
    ['prescriptions', 'Recetas', 'check']
  ],
  nurse: [
    ['overview', 'Sala de espera', 'users'],
    ['vitals', 'Signos vitales', 'activity'],
    ['procedures', 'Procedimientos', 'check']
  ],
  patient: [
    ['overview', 'Inicio', 'activity'],
    ['appointments', 'Mis citas', 'calendar'],
    ['prescriptions', 'Mis recetas', 'check'],
    ['documents', 'Resultados', 'activity'],
    ['profile', 'Mis datos', 'users']
  ],
  receptionist: [
    ['overview', 'Agenda', 'calendar'],
    ['patients', 'Pacientes', 'users'],
    ['billing', 'Caja y facturación', 'chart']
  ],
  pharmacy: [
    ['overview', 'Recetas pendientes', 'check'],
    ['inventory', 'Inventario', 'chart'],
    ['dispensing', 'Despacho', 'activity']
  ]
}

const paths = {
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-5 5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m18 6-12 12M6 6l12 12" />
}

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`vitacare:${key}`)) ?? initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(`vitacare:${key}`, JSON.stringify(value))
    } catch {}
  }, [key, value])
  return [value, setValue]
}

async function digestPassword(password) {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')
}

function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function Empty({ title, text }) {
  return (
    <div className="workspace-empty">
      <span>
        <Icon name="check" size={20} />
      </span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

function Login({ onLogin }) {
  const [register, setRegister] = useState(false)
  const [notice, setNotice] = useState('')
  const [accounts, setAccounts] = useStored('accounts', [])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: '',
    confirm: ''
  })

  const update = (event) =>
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (register) {
      if (form.password !== form.confirm) {
        setNotice('Las contraseñas no coinciden.')
        return
      }
      if (
        accounts.some(
          (account) =>
            account.email.toLowerCase() === form.email.toLowerCase()
        )
      ) {
        setNotice('Ese correo ya está registrado.')
        return
      }
      setLoading(true)
      const passwordHash = await digestPassword(form.password)
      setAccounts((current) => [
        ...current,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          passwordHash
        }
      ])
      setLoading(false)
      setRegister(false)
      setNotice('Cuenta creada exitosamente. Inicia sesión para continuar.')
      return
    }

    setLoading(true)
    setNotice('')
    const account = accounts.find(
      (item) => item.email.toLowerCase() === form.email.toLowerCase()
    )
    const demoNames = {
      admin: 'Laura Méndez',
      doctor: 'Andrés Silva',
      nurse: 'Mariana López',
      patient: 'Valentina Ríos',
      receptionist: 'Paula Herrera',
      pharmacy: 'Gabriel Soto'
    }
    const passwordHash = account ? await digestPassword(form.password) : null
    const result = account
      ? account.passwordHash === passwordHash && account.role === form.role
        ? account
        : null
      : {
          name: form.name.trim() || demoNames[form.role],
          email: form.email,
          role: form.role
        }

    if (!result) {
      setLoading(false)
      setNotice('Credenciales o rol incorrectos.')
      return
    }

    const claims = btoa(
      JSON.stringify({
        sub: result.email,
        role: result.role,
        exp: Math.floor(Date.now() / 1000) + 3600
      })
    )
    const token = `demo.${claims}.vitacare`
    await new Promise((resolve) => window.setTimeout(resolve, 350))
    setLoading(false)
    onLogin({
      name: result.name,
      email: result.email,
      role: result.role,
      roleLabel: roles.find(([id]) => id === result.role)[1],
      token
    })
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <a className="login-brand" href="#">
          <span className="brand-mark">
            <Icon name="activity" />
          </span>
          <span>
            vita<span>care</span>
            <small>CLÍNICA INTEGRAL</small>
          </span>
        </a>
        <div className="login-visual-copy">
          <span className="login-overline">CUIDAMOS DE QUIENES CUIDAN</span>
          <h1>
            La salud de tu clínica, <em>en buenas manos.</em>
          </h1>
          <p>
            Un espacio integrado para acompañarte en cada etapa de la atención y
            gestión médica.
          </p>
          <div className="login-visual-team">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=85"
              alt="Médica"
            />
            <img
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=85"
              alt="Médico"
            />
            <span>Equipos conectados en tiempo real</span>
          </div>
        </div>
        <div className="login-visual-footer">© 2026 VitaCare Clínica Integral</div>
      </section>

      <section className="login-content">
        <div className="login-form-wrap">
          <div className="login-heading">
            <span className="eyebrow">
              {register ? 'ÚNETE A VITACARE' : 'BIENVENIDO/A'}
            </span>
            <h2>{register ? 'Crear una cuenta' : 'Iniciar sesión'}</h2>
            <p>
              {register
                ? 'Crea tu perfil y selecciona tu rol en la clínica.'
                : 'Ingresa tus credenciales para acceder a tu entorno.'}
            </p>
          </div>
          <form className="login-form" onSubmit={submit}>
            {register && (
              <>
                <label>Nombre completo</label>
                <div className="login-input-wrap">
                  <input
                    name="name"
                    value={form.name}
                    onChange={update}
                    required
                    placeholder="Ej. Dra. Laura Méndez"
                  />
                </div>
              </>
            )}
            <label>Correo electrónico</label>
            <div className="login-input-wrap">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                required
                placeholder="usuario@clinica.com"
              />
            </div>
            <label>Rol de acceso</label>
            <div className="login-input-wrap role-select-wrap">
              <select name="role" value={form.role} onChange={update}>
                {roles.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <label>Contraseña</label>
            <div className="login-input-wrap">
              <input
                name="password"
                type="password"
                minLength="6"
                value={form.password}
                onChange={update}
                required
                autoComplete={register ? 'new-password' : 'current-password'}
              />
            </div>
            {register && (
              <>
                <label>Confirmar contraseña</label>
                <div className="login-input-wrap">
                  <input
                    name="confirm"
                    type="password"
                    value={form.confirm}
                    onChange={update}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </>
            )}
            {notice && (
              <p className="login-notice" role="status">
                {notice}
              </p>
            )}
            <button className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Procesando…
                </>
              ) : (
                <>
                  {register ? 'Registrarse' : 'Acceder al sistema'}{' '}
                  <Icon name="chevron" />
                </>
              )}
            </button>
          </form>
          <div className="login-demo-note">
            <p>
              <strong>Modo Demostración</strong>
              <br />
              El inicio de sesión usa JWT simulado. Puedes usar credenciales
              ficticias con el rol deseado.
            </p>
          </div>
          <div className="login-mode-switch">
            {register ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setRegister(!register)
                setNotice('')
              }}
            >
              {register ? 'Inicia sesión' : 'Regístrate aquí'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

const seed = [
  {
    id: 'q-seed-1',
    name: 'Valentina Ríos',
    email: 'valentina@vitacare.test',
    initials: 'VR',
    time: '09:00',
    reason: 'Control preventivo',
    state: 'En espera'
  },
  {
    id: 'q-seed-2',
    name: 'Mateo González',
    email: 'mateo@vitacare.test',
    initials: 'MG',
    time: '09:30',
    reason: 'Cardiología',
    state: 'En espera'
  }
]

const unsplashPeople = {
  'Valentina Ríos': 'photo-1559839734-2b71ea197ec2',
  'Mateo González': 'photo-1612349317150-e413f6a5b16d',
  'Camila Torres': 'photo-1594824476967-48c8b964273f',
  'Laura Méndez': 'photo-1559839734-2b71ea197ec2',
  'Dra. Laura Méndez': 'photo-1559839734-2b71ea197ec2',
  'Andrés Silva': 'photo-1612349317150-e413f6a5b16d',
  'Dr. Andrés Silva': 'photo-1612349317150-e413f6a5b16d',
  'Mariana López': 'photo-1594824476967-48c8b964273f',
  'Paula Herrera': 'photo-1551836022-d5d88e9218df',
  'Gabriel Soto': 'photo-1582750433449-648ed127bb54'
}

function PersonAvatar({ name, size = 'regular' }) {
  const photo = unsplashPeople[name] || unsplashPeople['Valentina Ríos']
  return (
    <img
      className={`health-avatar ${size}`}
      src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=160&q=85`}
      alt={name}
      loading="lazy"
    />
  )
}

function Avatar({ name, size = 'normal' }) {
  const photo = unsplashPeople[name] || unsplashPeople['Valentina Ríos']
  return (
    <img
      className={`health-avatar ${size}`}
      src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=120&q=85`}
      alt={name}
      loading="lazy"
    />
  )
}

function Dashboard({ session, logout }) {
  const [view, setView] = useState('overview')
  const [mobile, setMobile] = useState(false)
  const [dialog, setDialog] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const toastTimer = useRef(null)

  const [queue, setQueue] = useStored('queue', seed)
  const [users, setUsers] = useStored('users', [
    {
      name: 'Dra. Laura Méndez',
      email: 'laura@demo.test',
      role: 'Médico',
      status: 'Activo'
    }
  ])
  const [specialties, setSpecialties] = useStored('specialties', [
    'Medicina general',
    'Cardiología',
    'Pediatría',
    'Neurología'
  ])
  const [stock, setStock] = useStored('stock', [
    { name: 'Paracetamol', qty: 42 },
    { name: 'Amoxicilina', qty: 8 }
  ])
  const [rx, setRx] = useStored('rx', [
    {
      id: 'rx-seed-1',
      patient: 'Valentina Ríos',
      pacienteId: 'valentina@vitacare.test',
      medicoId: 'laura@demo.test',
      doctor: 'Dra. Laura Méndez',
      medicine: 'Amoxicilina 500 mg',
      dose: '500 mg',
      instructions: 'Tomar cada 8 horas durante 5 días.',
      issuedAt: '2026-10-06',
      estadoDespacho: 'Pendiente',
      status: 'Firmada'
    }
  ])
  const [delivered, setDelivered] = useStored('delivered', [])
  const [vitals, setVitals] = useStored('vitals', [])
  const [procedures, setProcedures] = useStored('procedures', [])
  const [records, setRecords] = useStored('records', [])
  const [appointments, setAppointments] = useStored('appointments', [])
  const [invoices, setInvoices] = useStored('invoices', [])
  const [selected, setSelected] = useState(seed[0] || null)
  const [profile, setProfile] = useStored(`profile:${session.email}`, {
    name: session.name,
    email: session.email,
    phone: ''
  })
  const [schedules, setSchedules] = useStored('schedules', {})
  const [targetAppointment, setTargetAppointment] = useState(null)

  const menu = menus[session.role] || menus.admin
  const config = {
    admin: 'Administración',
    doctor: 'Área médica',
    nurse: 'Enfermería',
    patient: 'Mi salud',
    receptionist: 'Recepción',
    pharmacy: 'Farmacia'
  }[session.role]
  const title = menu.find(([id]) => id === view)?.[1] || menu[0][1]

  const notify = (text) => {
    setToast(text)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2400)
  }

  useEffect(() => {
    document.body.classList.toggle('vc-dashboard-loading', loading)
    return () => document.body.classList.remove('vc-dashboard-loading')
  }, [loading])

  // Mantener selected sincronizado si la cola cambia
  useEffect(() => {
    if (!selected && queue.length) setSelected(queue[0])
    if (selected && !queue.some((p) => p.id === selected.id)) {
      setSelected(queue[0] || null)
    }
  }, [queue, selected])

  const go = (id) => {
    setView(id)
    setMobile(false)
    setLoading(true)
    window.setTimeout(() => setLoading(false), 260)
  }

  const download = (filename) => {
    const url = URL.createObjectURL(
      new Blob(
        [`Documento descargado desde VitaCare.\nContenido de: ${filename}`],
        { type: 'text/plain' }
      )
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`
    link.click()
    URL.revokeObjectURL(url)
    notify('Documento descargado con éxito.')
  }

  const saveDialog = (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())

    if (dialog === 'user') {
      setUsers((old) => [...old, { ...data, status: 'Activo' }])
    }
    if (dialog === 'specialty') {
      setSpecialties((old) => [...old, data.name])
    }
    if (dialog === 'appointment') {
      const id = uid('appointment')
      const patientName = data.patient.trim()
      const created = {
        ...data,
        id,
        name: patientName,
        email: data.email || '',
        initials: patientName
          .split(' ')
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase(),
        state: 'En espera',
        reason: data.specialty
      }
      setQueue((old) => [...old, created])
      setAppointments((old) => [
        ...old,
        { ...data, id, patient: patientName, status: 'Confirmada' }
      ])
    }
    if (dialog === 'reschedule' && targetAppointment) {
      setQueue((old) =>
        old.map((item) =>
          item.id === targetAppointment.id
            ? { ...item, time: data.time, state: 'Reprogramada' }
            : item
        )
      )
      setAppointments((old) =>
        old.map((item) =>
          item.id === targetAppointment.id
            ? { ...item, time: data.time }
            : item
        )
      )
    }
    if (dialog === 'schedule') {
      setSchedules((old) => ({
        ...old,
        [data.professional]: {
          start: data.start,
          end: data.end,
          days: data.days
        }
      }))
    }
    if (dialog === 'inventory') {
      setStock((old) => [
        ...old,
        {
          name: data.name,
          qty: Number(data.qty),
          detail: data.detail || '',
          expiry: data.expiry
        }
      ])
    }
    if (dialog === 'prescription') {
      const patientRecord = queue.find((item) => item.name === data.patient)
      const prescription = {
        ...data,
        id: uid('rx'),
        medicoId: session.email,
        doctor: session.name,
        pacienteId:
          patientRecord?.email ||
          (data.patient === 'Valentina Ríos'
            ? 'valentina@vitacare.test'
            : data.patient),
        patient: data.patient,
        medications: [
          {
            medicineId: data.medicine,
            name: data.medicine,
            dose: data.dose,
            instructions: data.instructions
          }
        ],
        medicine: `${data.medicine} ${data.dose}`,
        instructions: data.instructions,
        issuedAt: new Date().toISOString(),
        estadoDespacho: 'Pendiente',
        status: 'Firmada'
      }
      setRx((old) => [...old, prescription])
    }
    if (dialog === 'procedure') {
      if (!selected) {
        notify('Selecciona un paciente primero.')
        return
      }
      setProcedures((old) => [
        ...old,
        {
          ...data,
          id: uid('proc'),
          patient: selected.name,
          patientId: selected.id,
          recordedAt: new Date().toISOString()
        }
      ])
    }

    notify('Cambios registrados en el sistema.')
    setDialog('')
    setTargetAppointment(null)
  }

  const pill = (text) => (
    <span
      className={`workspace-status ${
        /pendiente|bajo|espera|crítico|solicitada/i.test(text)
          ? 'warning'
          : 'success'
      }`}
    >
      <i />
      {text}
    </span>
  )

  const metric = (icon, label, value, note, color) => (
    <article className="workspace-metric">
      <span className={`workspace-metric-icon ${color || 'mint'}`}>
        <Icon name={icon} />
      </span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  )

  const heading = (text, button, action) => (
    <div className="workspace-page-title">
      <div>
        <h2>{text}</h2>
      </div>
      {button && (
        <button className="workspace-primary" onClick={action}>
          <Icon name="plus" />
          {button}
        </button>
      )}
    </div>
  )

  let body

  if (session.role === 'admin') {
    if (view === 'users') {
      body = (
        <>
          {heading('Gestión de usuarios', 'Crear usuario', () =>
            setDialog('user')
          )}
          {users.map((u, i) => (
            <div className="workspace-card" key={u.email}>
              {u.name} · {u.role} · {pill(u.status)}{' '}
              <button
                className="text-action"
                onClick={() => {
                  setUsers((old) =>
                    old.map((x, j) =>
                      j === i
                        ? {
                            ...x,
                            status: x.status === 'Activo' ? 'Inactivo' : 'Activo'
                          }
                        : x
                    )
                  )
                  notify('Estado actualizado')
                }}
              >
                Activar / desactivar
              </button>
            </div>
          ))}
        </>
      )
    } else if (view === 'specialties') {
      body = (
        <>
          {heading('Especialidades', 'Agregar', () => setDialog('specialty'))}
          {specialties.map((s) => (
            <div className="workspace-card" key={s}>
              {s}
            </div>
          ))}
        </>
      )
    } else if (view === 'schedules') {
      body = (
        <section className="workspace-card">
          <h3>Horarios del personal</h3>
          {users.map((u) => (
            <form
              className="schedule-row"
              key={u.email}
              onSubmit={(e) => {
                e.preventDefault()
                const d = Object.fromEntries(
                  new FormData(e.currentTarget).entries()
                )
                setSchedules((old) => ({ ...old, [u.email]: d }))
                notify('Horario guardado')
              }}
            >
              <strong>{u.name}</strong>
              <label>
                Inicio
                <input
                  type="time"
                  name="start"
                  defaultValue={schedules[u.email]?.start || '08:00'}
                />
              </label>
              <label>
                Fin
                <input
                  type="time"
                  name="end"
                  defaultValue={schedules[u.email]?.end || '17:00'}
                />
              </label>
              <button className="text-action">Guardar</button>
            </form>
          ))}
        </section>
      )
    } else {
      body = (
        <>
          <div className="workspace-metrics">
            {metric(
              'chart',
              'Ingresos del mes',
              `$${(
                25000 + invoices.reduce((a, x) => a + x.amount, 0)
              ).toLocaleString('es')}`,
              'Facturación calculada'
            )}
            {metric(
              'calendar',
              'Citas en agenda',
              queue.length + appointments.length,
              'Para hoy y próximos días',
              'blue'
            )}
            {metric(
              'users',
              'Pacientes activos',
              new Set([
                ...queue.map((p) => p.name),
                ...appointments.map((a) => a.patient)
              ]).size,
              'Registrados',
              'violet'
            )}
          </div>
          <div className="workspace-columns admin-overview-grid">
            <section className="workspace-card">
              <div className="chart-panel-heading">
                <div>
                  <span className="workspace-kicker">MÉTRICAS</span>
                  <h3>Resumen semanal</h3>
                  <p>Volumen de citas e ingresos</p>
                </div>
                <span className="soft-badge">Últimos 7 días</span>
              </div>
              <div className="chart-legend">
                <span>
                  <i className="legend-teal" />
                  Citas
                </span>
                <span>
                  <i className="legend-blue" />
                  Ingresos
                </span>
              </div>
              <div className="bar-chart">
                {[
                  ['L', 48, 32],
                  ['M', 68, 49],
                  ['X', 57, 39],
                  ['J', 86, 63],
                  ['V', 73, 52],
                  ['S', 41, 28],
                  ['D', 27, 18]
                ].map(([day, a, b]) => (
                  <div className="bar-group" key={day}>
                    <div className="bar-pair">
                      <i style={{ height: `${a}%` }} />
                      <i style={{ height: `${b}%` }} />
                    </div>
                    <small>{day}</small>
                  </div>
                ))}
              </div>
            </section>
            <section className="workspace-card admin-team-panel">
              <div className="chart-panel-heading">
                <div>
                  <span className="workspace-kicker">DIRECTORIO</span>
                  <h3>Personal médico</h3>
                  <p>{users.length} profesionales</p>
                </div>
                <button className="text-action" onClick={() => go('users')}>
                  Ver todos
                </button>
              </div>
              {users.slice(0, 5).map((u) => (
                <div className="admin-team-row" key={u.email}>
                  <PersonAvatar name={u.name} />
                  <span>
                    <strong>{u.name}</strong>
                    <small>{u.role}</small>
                  </span>
                  {pill(u.status)}
                </div>
              ))}
            </section>
          </div>
        </>
      )
    }
  } else if (session.role === 'doctor') {
    if (view === 'history') {
      body = (
        <div className="workspace-columns clinical-split">
          <section className="workspace-card clinical-history-panel">
            <div className="clinical-patient-banner">
              <PersonAvatar name={selected?.name} size="large" />
              <div>
                <span className="workspace-kicker">HISTORIA CLÍNICA</span>
                <h2>{selected?.name || 'Sin paciente'}</h2>
                <p>{selected?.reason} · Ficha VitaCare</p>
              </div>
            </div>
            <div className="clinical-facts">
              <span>
                <small>ALERGIAS</small>
                <strong>No declaradas</strong>
              </span>
              <span>
                <small>ÚLTIMA CITA</small>
                <strong>18 sep 2026</strong>
              </span>
              <span>
                <small>TIPO DE SANGRE</small>
                <strong>O+</strong>
              </span>
            </div>
            <div className="clinical-history-items">
              <h3>Evoluciones Anteriores</h3>
              {records
                .filter((r) => r.patient === selected?.name)
                .map((r, i) => (
                  <article className="clinical-history-item" key={i}>
                    <span className="timeline-marker" />
                    <strong>{r.diagnosis}</strong>
                    <p>{r.notes}</p>
                    <small>
                      {r.date || 'Consulta previa'} · {r.exam}
                    </small>
                  </article>
                ))}
              {!records.some((r) => r.patient === selected?.name) && (
                <div className="clinical-history-item">
                  <span className="timeline-marker" />
                  <strong>Visita preventiva</strong>
                  <p>Paciente estable en la última revisión general.</p>
                  <small>18 sep 2026</small>
                </div>
              )}
            </div>
          </section>
          <section className="workspace-card current-consult-panel">
            <div className="consult-form-heading">
              <span className="workspace-kicker">NUEVA ATENCIÓN</span>
              <h2>Registrar consulta actual</h2>
              <p>Los datos se añadirán al historial del paciente.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!selected) {
                  notify('Selecciona un paciente de la agenda.')
                  return
                }
                const d = Object.fromEntries(
                  new FormData(e.currentTarget).entries()
                )
                setRecords((old) => [
                  ...old,
                  {
                    ...d,
                    patient: selected.name,
                    date: new Date().toLocaleString('es')
                  }
                ])
                notify('Evolución guardada en la historia clínica')
                e.currentTarget.reset()
              }}
            >
              <label className="workspace-field">
                Diagnóstico CIE-10
                <select name="diagnosis" required>
                  <option value="">Seleccionar...</option>
                  <option>Chequeo preventivo</option>
                  <option>Hipertensión Arterial</option>
                  <option>Infección Viral</option>
                </select>
              </label>
              <label className="workspace-field">
                Observaciones Clínicas
                <textarea
                  name="notes"
                  rows="4"
                  required
                  placeholder="Subjetivo, Objetivo, Análisis y Plan (SOAP)..."
                />
              </label>
              <label className="workspace-field">
                Órdenes de Exámenes
                <select name="exam">
                  <option>Ninguno</option>
                  <option>Hemograma y Perfil Lipídico</option>
                  <option>Rayos X Tórax</option>
                </select>
              </label>
              <div className="consult-bottom-actions">
                <button
                  type="button"
                  className="workspace-secondary"
                  onClick={() => setDialog('prescription')}
                >
                  Generar Receta
                </button>
                <button className="workspace-primary">Firmar Evolución</button>
              </div>
            </form>
          </section>
        </div>
      )
    } else if (view === 'prescriptions') {
      body = (
        <section className="workspace-card">
          <div className="prescription-page-head">
            <div>
              <span className="workspace-kicker">MÓDULO DE RECETAS</span>
              <h2>Fórmulas Digitales</h2>
              <p>Conectado en tiempo real con farmacia.</p>
            </div>
            <button
              className="workspace-primary"
              onClick={() => setDialog('prescription')}
            >
              <Icon name="plus" />
              Emitir nueva receta
            </button>
          </div>
          {rx.length ? (
            rx.map((r) => (
              <article className="rx-record-card" key={r.id}>
                <Avatar name={r.patient} />
                <div className="rx-record-main">
                  <strong>{r.patient}</strong>
                  <span>{r.medicine}</span>
                  <small>
                    {r.instructions} · Fecha:{' '}
                    {r.issuedAt
                      ? new Date(r.issuedAt).toLocaleDateString('es')
                      : 'Hoy'}
                  </small>
                </div>
                <div className="rx-record-state">
                  {pill(r.status)}
                  <small>Estado: {r.estadoDespacho}</small>
                </div>
                <button
                  className="text-action"
                  onClick={() => download(`Receta-${r.patient}`)}
                >
                  Imprimir PDF
                </button>
              </article>
            ))
          ) : (
            <Empty
              title="Sin recetas"
              text="Aún no se han emitido fórmulas en este turno."
            />
          )}
        </section>
      )
    } else {
      body = (
        <>
          <div className="workspace-metrics three">
            {metric('calendar', 'Citas asignadas', queue.length, 'Para el turno actual')}
            {metric(
              'clock',
              'Próxima atención',
              queue[0]?.time || '--:--',
              queue[0]?.name || 'Agenda libre',
              'blue'
            )}
            {metric(
              'users',
              'Esperando en sala',
              queue.filter((p) => p.state === 'En sala').length,
              'Pacientes listos',
              'amber'
            )}
          </div>
          <div className="workspace-columns doctor-columns">
            <section className="workspace-card doctor-agenda-card">
              <div className="doctor-agenda-heading">
                <div>
                  <h3>Mi Agenda Diaria</h3>
                  <p>Vista del día en curso</p>
                </div>
              </div>
              {queue.map((p) => (
                <button
                  className={`doctor-appointment ${
                    selected?.id === p.id ? 'selected' : ''
                  }`}
                  key={p.id}
                  onClick={() => setSelected(p)}
                >
                  <time>{p.time}</time>
                  <PersonAvatar name={p.name} />
                  <span className="doctor-appointment-person">
                    <strong>{p.name}</strong>
                    <small>{p.reason}</small>
                  </span>
                  {pill(p.state)}
                </button>
              ))}
            </section>
            <section className="workspace-card doctor-current-patient">
              {selected ? (
                <>
                  <div className="current-patient-top">
                    <PersonAvatar name={selected.name} size="large" />
                    <div>
                      <span className="workspace-kicker">PACIENTE EN TURNO</span>
                      <h3>{selected.name}</h3>
                      <p>
                        {selected.time} · {selected.reason}
                      </p>
                    </div>
                  </div>
                  <div className="current-patient-summary">
                    <span>
                      Última atención
                      <strong>Hace 2 semanas</strong>
                    </span>
                    <span>
                      Estado en recepción
                      <strong>{selected.state}</strong>
                    </span>
                  </div>
                  <button
                    className="workspace-primary"
                    style={{ width: '100%' }}
                    onClick={() => go('history')}
                  >
                    Iniciar Consulta Clínica
                  </button>
                </>
              ) : (
                <Empty
                  title="Selecciona una cita"
                  text="Toca un paciente de tu agenda para ver detalles."
                />
              )}
            </section>
          </div>
        </>
      )
    }
  } else if (session.role === 'nurse') {
    // ============ VISTAS DE ENFERMERÍA CORREGIDAS ============
    if (view === 'vitals') {
      body = (
        <>
          <div className="workspace-metrics three">
            {metric('users', 'Pacientes en sala', queue.length, 'Pendientes de triage')}
            {metric(
              'check',
              'Signos registrados',
              vitals.length,
              'En el turno actual',
              'blue'
            )}
            {metric(
              'activity',
              'Procedimientos',
              procedures.length,
              'Curaciones/Inyecciones',
              'violet'
            )}
          </div>
          <div className="workspace-columns nurse-columns">
            <section className="workspace-card nurse-queue-panel">
              <div className="queue-panel-heading">
                <div>
                  <span className="workspace-kicker">SELECCIONAR PACIENTE</span>
                  <h3>Fila de atención</h3>
                </div>
              </div>
              {queue.map((p) => (
                <article className="nurse-queue-row" key={p.id}>
                  <PersonAvatar name={p.name} />
                  <button
                    className="queue-patient-info"
                    onClick={() => setSelected(p)}
                  >
                    <strong>{p.name}</strong>
                    <small>
                      Hora Cita: {p.time} · Especialidad: {p.reason}
                    </small>
                  </button>
                  {pill(p.state)}
                </article>
              ))}
            </section>
            <section className="workspace-card nurse-vitals-card">
              <div className="nurse-selected-patient">
                <PersonAvatar name={selected?.name} size="large" />
                <div>
                  <span className="workspace-kicker">SIGNOS VITALES</span>
                  <h3>{selected?.name || 'Selecciona paciente'}</h3>
                  <p>
                    {selected
                      ? 'Registrar parámetros antes de la consulta'
                      : '---'}
                  </p>
                </div>
              </div>
              {selected && (
                <form
                  className="vitals-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const d = Object.fromEntries(
                      new FormData(e.currentTarget).entries()
                    )
                    setVitals((old) => [
                      ...old.filter((x) => x.patient !== selected.name),
                      {
                        ...d,
                        patient: selected.name,
                        patientId: selected.id,
                        recordedAt: new Date().toISOString()
                      }
                    ])
                    notify('Parámetros guardados y enviados al médico.')
                    e.currentTarget.reset()
                  }}
                >
                  <label>
                    Presión (mmHg)
                    <input name="pressure" required placeholder="Ej: 120/80" />
                  </label>
                  <label>
                    Temperatura (°C)
                    <input
                      name="temperature"
                      type="number"
                      step="0.1"
                      required
                      placeholder="Ej: 36.5"
                    />
                  </label>
                  <label>
                    Peso (kg)
                    <input
                      name="weight"
                      type="number"
                      step="0.1"
                      required
                      placeholder="Ej: 70.2"
                    />
                  </label>
                  <label>
                    Talla (cm)
                    <input
                      name="height"
                      type="number"
                      required
                      placeholder="Ej: 175"
                    />
                  </label>
                  <button className="workspace-primary">
                    <Icon name="check" />
                    Guardar en Historia
                  </button>
                </form>
              )}
            </section>
          </div>
        </>
      )
    } else if (view === 'procedures') {
      body = (
        <>
          <div className="workspace-metrics three">
            {metric(
              'activity',
              'Procedimientos',
              procedures.length,
              'Registrados hoy',
              'violet'
            )}
            {metric('users', 'Pacientes en sala', queue.length, 'Disponibles')}
          </div>
          <div className="workspace-columns nurse-columns">
            <section className="workspace-card">
              <div className="prescription-page-head">
                <div>
                  <span className="workspace-kicker">PROCEDIMIENTOS</span>
                  <h2>Registro de curaciones e inyecciones</h2>
                </div>
                <button
                  className="workspace-primary"
                  onClick={() => {
                    if (!selected) {
                      notify('Selecciona un paciente primero.')
                      return
                    }
                    setDialog('procedure')
                  }}
                >
                  <Icon name="plus" />
                  Nuevo procedimiento
                </button>
              </div>
              {procedures.length ? (
                procedures.map((proc) => (
                  <article className="rx-record-card" key={proc.id}>
                    <PersonAvatar name={proc.patient} />
                    <div className="rx-record-main">
                      <strong>{proc.patient}</strong>
                      <span>{proc.type || proc.name || 'Procedimiento'}</span>
                      <small>
                        {proc.notes || ''} ·{' '}
                        {proc.recordedAt
                          ? new Date(proc.recordedAt).toLocaleString('es')
                          : ''}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <Empty
                  title="Sin procedimientos"
                  text="Aún no se han registrado curaciones o inyecciones."
                />
              )}
            </section>
            <section className="workspace-card nurse-queue-panel">
              <div className="queue-panel-heading">
                <div>
                  <span className="workspace-kicker">PACIENTE ACTUAL</span>
                  <h3>Selecciona para registrar</h3>
                </div>
              </div>
              {queue.map((p) => (
                <article className="nurse-queue-row" key={p.id}>
                  <PersonAvatar name={p.name} />
                  <button
                    className="queue-patient-info"
                    onClick={() => setSelected(p)}
                  >
                    <strong>{p.name}</strong>
                    <small>
                      {p.time} · {p.reason}
                    </small>
                  </button>
                  {selected?.id === p.id && pill('Seleccionado')}
                </article>
              ))}
            </section>
          </div>
        </>
      )
    } else {
      // overview - sala de espera
      body = (
        <>
          <div className="workspace-metrics three">
            {metric('users', 'Pacientes en sala', queue.length, 'Pendientes de triage')}
            {metric(
              'check',
              'Signos registrados',
              vitals.length,
              'En el turno actual',
              'blue'
            )}
            {metric(
              'activity',
              'Procedimientos',
              procedures.length,
              'Curaciones/Inyecciones',
              'violet'
            )}
          </div>
          <div className="workspace-columns nurse-columns">
            <section className="workspace-card nurse-queue-panel">
              <div className="queue-panel-heading">
                <div>
                  <span className="workspace-kicker">TRIAGE Y ESPERA</span>
                  <h3>Fila de atención</h3>
                </div>
                <span className="queue-live">
                  <i />
                  Actualizado
                </span>
              </div>
              {queue.map((p) => (
                <article className="nurse-queue-row" key={p.id}>
                  <PersonAvatar name={p.name} />
                  <button
                    className="queue-patient-info"
                    onClick={() => setSelected(p)}
                  >
                    <strong>{p.name}</strong>
                    <small>
                      Hora Cita: {p.time} · Especialidad: {p.reason}
                    </small>
                  </button>
                  {pill(p.state)}
                  <button
                    className="queue-state-button"
                    onClick={() => {
                      setQueue((old) =>
                        old.map((x) =>
                          x.id === p.id ? { ...x, state: 'En sala' } : x
                        )
                      )
                      notify(`Llamando a ${p.name}`)
                    }}
                  >
                    {p.state === 'En sala' ? 'Llamado' : 'Llamar a triage'}
                  </button>
                </article>
              ))}
            </section>
            <section className="workspace-card nurse-vitals-card">
              <div className="nurse-selected-patient">
                <PersonAvatar name={selected?.name} size="large" />
                <div>
                  <span className="workspace-kicker">PACIENTE SELECCIONADO</span>
                  <h3>{selected?.name || 'Selecciona paciente'}</h3>
                  <p>
                    {selected
                      ? `${selected.time} · ${selected.reason}`
                      : '---'}
                  </p>
                </div>
              </div>
              {selected && (
                <div style={{ marginTop: 16 }}>
                  <button
                    className="workspace-primary"
                    style={{ width: '100%', marginBottom: 8 }}
                    onClick={() => go('vitals')}
                  >
                    Registrar signos vitales
                  </button>
                  <button
                    className="workspace-secondary"
                    style={{ width: '100%' }}
                    onClick={() => go('procedures')}
                  >
                    Registrar procedimiento
                  </button>
                </div>
              )}
            </section>
          </div>
        </>
      )
    }
  } else if (session.role === 'patient') {
    if (view === 'prescriptions') {
      const mine = rx.filter(
        (r) =>
          r.pacienteId === session.email || r.patient === session.name
      )
      body = (
        <section className="workspace-card patient-rx-panel">
          <div className="patient-section-heading">
            <span className="workspace-kicker">FARMACIA</span>
            <h2>Mis Recetas</h2>
            <p>
              Tus medicamentos prescritos y estado de retiro en la clínica.
            </p>
          </div>
          {mine.length ? (
            mine.map((r) => (
              <article className="patient-prescription-card" key={r.id}>
                <div className="patient-rx-icon">
                  <Icon name="check" />
                </div>
                <div className="patient-rx-info">
                  <div className="patient-rx-top">
                    <strong>{r.medicine}</strong>
                    {pill(r.estadoDespacho)}
                  </div>
                  <p>{r.instructions}</p>
                  <small>
                    Doctor: {r.doctor} · Fecha de emisión:{' '}
                    {r.issuedAt
                      ? new Date(r.issuedAt).toLocaleDateString('es')
                      : 'Hoy'}
                  </small>
                </div>
                <button
                  className="text-action"
                  onClick={() => download(`Mi-Receta-${r.medicine}`)}
                >
                  PDF
                </button>
              </article>
            ))
          ) : (
            <Empty
              title="Tu historial está limpio"
              text="Cuando un médico te recete un medicamento, aparecerá aquí."
            />
          )}
        </section>
      )
    } else if (view === 'appointments') {
      body = (
        <section className="workspace-card">
          <h3>Mis Próximas Citas</h3>
          {appointments.map((a) => (
            <div className="patient-appointment-card" key={a.id}>
              <div className="patient-rx-icon">
                <Icon name="calendar" />
              </div>
              <div className="patient-appointment-info">
                <strong>{a.specialty}</strong>
                <small>
                  Fecha: {a.date} a las {a.time} hrs
                </small>
              </div>
              {pill(a.status)}
              {a.status !== 'Cancelada' && (
                <button
                  className="text-action danger-action"
                  onClick={() => {
                    setAppointments((old) =>
                      old.map((x) =>
                        x.id === a.id ? { ...x, status: 'Cancelada' } : x
                      )
                    )
                    notify('Cita cancelada correctamente')
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </section>
      )
    } else if (view === 'documents') {
      body = (
        <section className="workspace-card">
          <h3>Resultados de Laboratorio</h3>
          <p>Descarga tus informes médicos.</p>
          <button
            className="workspace-secondary"
            onClick={() => download('Resultados_Sangre')}
          >
            Hemograma Completo
          </button>
        </section>
      )
    } else if (view === 'profile') {
      body = (
        <section className="workspace-card">
          <h3>Actualizar mis datos</h3>
          <form
            className="profile-form"
            onSubmit={(e) => {
              e.preventDefault()
              const d = Object.fromEntries(
                new FormData(e.currentTarget).entries()
              )
              setProfile(d)
              notify('Información actualizada')
            }}
          >
            <label>
              Nombre Completo
              <input name="name" defaultValue={profile.name} required />
            </label>
            <label>
              Correo de contacto
              <input
                name="email"
                type="email"
                defaultValue={profile.email}
                required
              />
            </label>
            <label>
              Teléfono Celular
              <input name="phone" defaultValue={profile.phone} />
            </label>
            <button className="workspace-primary">Actualizar Perfil</button>
          </form>
        </section>
      )
    } else {
      const nextApt = appointments.find((a) => a.status !== 'Cancelada')
      body = (
        <>
          <section className="patient-hero-card">
            <div>
              <span className="workspace-kicker">BIENVENIDO/A</span>
              <h2>Hola, {profile.name.split(' ')[0]}</h2>
              <p>Gestiona tu salud y consultas desde un solo lugar.</p>
              <div className="patient-hero-actions">
                <button
                  className="workspace-primary"
                  onClick={() => setView('appointments')}
                >
                  Solicitar Cita
                </button>
                <button
                  className="workspace-secondary"
                  onClick={() => setView('prescriptions')}
                >
                  Ver mis Recetas
                </button>
              </div>
            </div>
            <div className="patient-hero-photo">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=520&q=85"
                alt="Clínica"
              />
            </div>
          </section>
          <div className="workspace-metrics three">
            {metric(
              'calendar',
              'Citas Activas',
              appointments.filter((a) => a.status !== 'Cancelada').length,
              'Programadas'
            )}
            {metric(
              'check',
              'Recetas para retiro',
              rx.filter(
                (r) =>
                  (r.pacienteId === session.email ||
                    r.patient === session.name) &&
                  r.estadoDespacho !== 'Despachado'
              ).length,
              'Farmacia',
              'blue'
            )}
          </div>
          <div className="workspace-columns patient-home-columns">
            <section className="workspace-card patient-next-visit">
              <div className="patient-section-heading">
                <span className="workspace-kicker">AGENDA</span>
                <h3>Tu próxima cita</h3>
              </div>
              {nextApt ? (
                <div className="patient-next-card">
                  <div className="appointment-date-icon">
                    <span>{nextApt.date?.split('-')[1] || '--'}</span>
                    <strong>{nextApt.date?.split('-')[2] || '??'}</strong>
                  </div>
                  <div>
                    <strong>{nextApt.specialty}</strong>
                    <small>
                      {nextApt.time} hrs · Consultorio Principal
                    </small>
                  </div>
                  {pill(nextApt.status)}
                </div>
              ) : (
                <Empty
                  title="Sin citas próximas"
                  text="Utiliza el formulario para reservar."
                />
              )}

              <h3
                style={{
                  marginTop: '20px',
                  fontSize: '11px',
                  color: '#4a5d6a'
                }}
              >
                Reservar nueva consulta
              </h3>
              <form
                className="patient-book-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  const d = Object.fromEntries(
                    new FormData(e.currentTarget).entries()
                  )
                  const id = uid('patient-apt')
                  const appointment = {
                    ...d,
                    id,
                    time: d.time || '09:00',
                    status: 'Solicitada'
                  }
                  setAppointments((old) => [...old, appointment])
                  setQueue((old) => [
                    ...old,
                    {
                      ...appointment,
                      id: uid('q'),
                      name: session.name,
                      email: session.email,
                      initials: session.name
                        .split(' ')
                        .map((x) => x[0])
                        .slice(0, 2)
                        .join(''),
                      reason: d.specialty,
                      state: 'Solicitada'
                    }
                  ])
                  notify('Tu solicitud ha sido enviada a Recepción.')
                  go('appointments')
                }}
              >
                <label>
                  Especialidad
                  <select name="specialty">
                    {specialties.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <div className="form-row">
                  <label>
                    Fecha
                    <input name="date" type="date" required />
                  </label>
                  <label>
                    Hora
                    <select name="time">
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </label>
                </div>
                <button className="workspace-primary">
                  <Icon name="calendar" />
                  Confirmar Solicitud
                </button>
              </form>
            </section>
          </div>
        </>
      )
    }
  } else if (session.role === 'receptionist') {
    if (view === 'billing') {
      body = (
        <section className="workspace-card">
          <h3>Módulo de Facturación</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const d = Object.fromEntries(
                new FormData(e.currentTarget).entries()
              )
              setInvoices((old) => [
                ...old,
                { ...d, id: Date.now(), amount: Number(d.amount) }
              ])
              notify('Factura procesada con éxito')
              e.currentTarget.reset()
            }}
          >
            <label className="workspace-field">
              Paciente
              <select name="patient">
                {queue.map((p) => (
                  <option key={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="workspace-field">
              Concepto (Consulta/Procedimiento)
              <input name="service" required />
            </label>
            <label className="workspace-field">
              Valor a pagar ($)
              <input name="amount" type="number" required />
            </label>
            <button className="workspace-primary">Registrar Pago</button>
          </form>
        </section>
      )
    } else {
      body = (
        <>
          <div className="workspace-metrics three">
            {metric(
              'calendar',
              'Turnos de hoy',
              queue.length,
              'Agenda global de la clínica'
            )}
            {metric(
              'users',
              'Pacientes confirmados',
              queue.filter((p) => p.state === 'En sala').length,
              'Han reportado llegada',
              'blue'
            )}
            {metric(
              'chart',
              'Caja del día',
              `$${invoices
                .reduce((sum, i) => sum + i.amount, 0)
                .toLocaleString('es')}`,
              `${invoices.length} recibos generados`,
              'violet'
            )}
          </div>
          <section className="workspace-card reception-crm-card">
            <div className="prescription-page-head">
              <div>
                <span className="workspace-kicker">FLUJO DE PACIENTES</span>
                <h2>Control de Recepción</h2>
                <p>
                  Visualiza todas las agendas médicas y marca llegadas.
                </p>
              </div>
              <button
                className="workspace-primary"
                onClick={() => setDialog('appointment')}
              >
                <Icon name="plus" />
                Dar turno manual
              </button>
            </div>
            {queue.map((p) => (
              <article className="reception-arrival-row" key={p.id}>
                <time>{p.time}</time>
                <PersonAvatar name={p.name} />
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.reason} · Profesional asignado</small>
                </div>
                {pill(p.state)}
                <button
                  className="text-action"
                  onClick={() => {
                    setTargetAppointment(p)
                    setDialog('reschedule')
                  }}
                >
                  Modificar hora
                </button>
                <button
                  className="text-action"
                  onClick={() => {
                    setQueue((old) =>
                      old.map((x) =>
                        x.id === p.id ? { ...x, state: 'En sala' } : x
                      )
                    )
                    notify(`${p.name} anunciado al consultorio`)
                  }}
                >
                  Paciente Llegó
                </button>
              </article>
            ))}
          </section>
        </>
      )
    }
  } else {
    // Farmacia
    if (view === 'inventory') {
      body = (
        <>
          <div className="inventory-alerts">
            {stock.filter((i) => i.qty <= 5).length > 0 && (
              <span className="inventory-alert red">
                <i />
                Productos con stock crítico (
                {stock.filter((i) => i.qty <= 5).length})
              </span>
            )}
          </div>
          <section className="workspace-card pharmacy-inventory-panel">
            <div className="prescription-page-head">
              <div>
                <span className="workspace-kicker">CONTROL DE STOCK</span>
                <h2>Inventario de Medicamentos</h2>
              </div>
              <button
                className="workspace-primary"
                onClick={() => setDialog('inventory')}
              >
                <Icon name="plus" />
                Ingresar mercancía
              </button>
            </div>
            <div className="workspace-table-wrap">
              <table className="workspace-table">
                <thead>
                  <tr>
                    <th>Fármaco</th>
                    <th>Existencias (Unidades)</th>
                    <th>Caducidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((i) => (
                    <tr key={i.name}>
                      <td>
                        <span className="inventory-name">
                          <strong>{i.name}</strong>
                          <small>{i.detail || 'Genérico/Comercial'}</small>
                        </span>
                      </td>
                      <td>{i.qty}</td>
                      <td>{i.expiry || 'N/A'}</td>
                      <td>
                        {pill(i.qty <= 5 ? 'Stock crítico' : 'Disponible')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )
    } else if (view === 'dispensing') {
      // Vista de despachos realizados
      body = (
        <>
          <div className="workspace-metrics three">
            {metric(
              'check',
              'Despachos completados',
              delivered.length,
              'En el turno actual'
            )}
            {metric(
              'activity',
              'Pendientes',
              rx.filter(
                (r) =>
                  r.estadoDespacho !== 'Despachado' && r.status === 'Firmada'
              ).length,
              'Por entregar',
              'amber'
            )}
          </div>
          <section className="workspace-card">
            <div className="prescription-page-head">
              <div>
                <span className="workspace-kicker">HISTORIAL DE DESPACHO</span>
                <h2>Medicamentos entregados</h2>
              </div>
            </div>
            {delivered.length ? (
              delivered.map((r) => (
                <article className="rx-record-card" key={r.id}>
                  <Avatar name={r.patient} />
                  <div className="rx-record-main">
                    <strong>{r.patient}</strong>
                    <span>{r.medicine}</span>
                    <small>
                      {r.instructions} · Despachado
                    </small>
                  </div>
                  {pill('Despachado')}
                </article>
              ))
            ) : (
              <Empty
                title="Sin despachos aún"
                text="Los medicamentos entregados aparecerán aquí."
              />
            )}
          </section>
        </>
      )
    } else {
      // overview - pendientes
      body = (
        <>
          <div className="workspace-metrics three">
            {metric(
              'check',
              'Recetas pendientes',
              rx.filter(
                (r) =>
                  r.estadoDespacho !== 'Despachado' && r.status === 'Firmada'
              ).length,
              'Para despachar hoy'
            )}
            {metric(
              'activity',
              'Alertas de inventario',
              stock.filter((i) => i.qty <= 8).length,
              'Requieren reabastecimiento',
              'amber'
            )}
            {metric(
              'users',
              'Medicamentos entregados',
              delivered.length,
              'Despachos completados',
              'blue'
            )}
          </div>
          <div className="workspace-columns pharmacy-columns">
            <section className="workspace-card pharmacy-inbox">
              <div className="workspace-section-title">
                <div>
                  <h3>Bandeja de Despacho POS</h3>
                  <p>Recetas emitidas por médicos en tiempo real</p>
                </div>
              </div>
              {rx.filter(
                (r) =>
                  r.estadoDespacho !== 'Despachado' && r.status === 'Firmada'
              ).length ? (
                rx
                  .filter(
                    (r) =>
                      r.estadoDespacho !== 'Despachado' &&
                      r.status === 'Firmada'
                  )
                  .map((r) => {
                    const med = stock.find(
                      (i) =>
                        r.medicine
                          .toLowerCase()
                          .includes(i.name.toLowerCase()) ||
                        i.name
                          .toLowerCase()
                          .includes(r.medicine.split(' ')[0].toLowerCase())
                    )
                    const available = !med || med.qty > 0
                    return (
                      <article className="pharmacy-rx-card" key={r.id}>
                        <div className="pharmacy-rx-person">
                          <PersonAvatar name={r.patient} />
                          <span>
                            <strong>{r.patient}</strong>
                            <small>Prescrito por: {r.doctor}</small>
                          </span>
                        </div>
                        <div className="pharmacy-rx-drug">
                          <span className="medicine-symbol">
                            <Icon name="check" />
                          </span>
                          <span>
                            <strong>{r.medicine}</strong>
                            <small>
                              Indicación médica: {r.instructions}
                            </small>
                          </span>
                        </div>
                        <div className="pharmacy-rx-footer">
                          <span
                            className={`stock-inline ${
                              available ? 'available' : 'unavailable'
                            }`}
                          >
                            <i />
                            {available
                              ? `En stock: ${med ? med.qty : 'Suficiente'}`
                              : 'Sin stock en sistema'}
                          </span>
                          <button
                            className="workspace-primary"
                            disabled={!available}
                            onClick={() => {
                              if (med) {
                                setStock((old) =>
                                  old.map((i) =>
                                    i.name === med.name
                                      ? { ...i, qty: Math.max(0, i.qty - 1) }
                                      : i
                                  )
                                )
                              }
                              setRx((old) =>
                                old.map((x) =>
                                  x.id === r.id
                                    ? { ...x, estadoDespacho: 'Despachado' }
                                    : x
                                )
                              )
                              setDelivered((old) => [...old, r])
                              notify(`Medicamento entregado a ${r.patient}`)
                            }}
                          >
                            Despachar y Descontar
                          </button>
                        </div>
                      </article>
                    )
                  })
              ) : (
                <Empty
                  title="Sin recetas pendientes"
                  text="Todas las fórmulas han sido despachadas."
                />
              )}
            </section>
            <section className="workspace-card pharmacy-stock-summary">
              <div className="workspace-section-title">
                <div>
                  <h3>Alertas de Inventario</h3>
                  <p>Monitoreo automático</p>
                </div>
              </div>
              {stock
                .filter((i) => i.qty <= 10)
                .map((item) => (
                  <div className="stock-alert-row" key={item.name}>
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.qty} unidades restantes</small>
                    </span>
                    {pill('Solicitar reposición')}
                  </div>
                ))}
            </section>
          </div>
        </>
      )
    }
  }

  return (
    <div className={`role-app role-${session.role}`}>
      <aside className={`role-sidebar ${mobile ? 'role-sidebar-open' : ''}`}>
        <a className="role-brand" href="#workspace">
          <span className="brand-mark">
            <Icon name="activity" />
          </span>
          <span>
            vita<span>care</span>
            <small>CLINICA</small>
          </span>
        </a>
        <div className="role-sidebar-caption">TU ESPACIO</div>
        <div className="role-badge">
          <span className={`role-badge-icon ${session.role}`}>
            <Icon name="users" />
          </span>
          <span>
            <strong>{config}</strong>
            <small>{session.roleLabel}</small>
          </span>
        </div>
        <nav className="role-navigation">
          {menu.map(([id, label, icon]) => (
            <button
              key={id}
              className={`role-nav-link ${view === id ? 'active' : ''}`}
              onClick={() => go(id)}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="role-sidebar-spacer" />
        <div className="role-user-card">
          <span className="role-user-avatar">
            {session.name
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </span>
          <span>
            <strong>{session.name}</strong>
            <small>{session.roleLabel}</small>
          </span>
          <button onClick={logout} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </div>
      </aside>
      <main className="role-main">
        <header className="role-topbar">
          <button
            className="role-mobile-menu"
            onClick={() => setMobile((x) => !x)}
          >
            <Icon name="menu" />
          </button>
          <div className="role-breadcrumb">
            VitaCare <Icon name="chevron" /> <strong>{title}</strong>
          </div>
          <div className="role-topbar-actions">
            <button
              className="role-notification"
              onClick={() => notify('Sistema al día')}
            >
              <Icon name="bell" />
            </button>
            <button className="role-logout-mobile" onClick={logout}>
              Salir
            </button>
          </div>
        </header>
        <div className="role-content">
          <div className="role-page-heading">
            <div>
              <span className="workspace-kicker">{config.toUpperCase()}</span>
              <h1>{title}</h1>
            </div>
          </div>
          {body}
          <footer className="role-footer">
            <span>© 2026 VitaCare Plataforma de Salud</span>
            <span>Demostración UI/UX</span>
          </footer>
        </div>
      </main>
      {dialog && (
        <Dialog
          type={dialog}
          close={() => setDialog('')}
          submit={saveDialog}
          users={users}
          queue={queue}
          stock={stock}
          specialties={specialties}
        />
      )}
      {toast && (
        <div className="workspace-toast" role="status">
          <span>
            <Icon name="check" size={14} />
          </span>{' '}
          {toast}
          <button onClick={() => setToast('')}>
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function Dialog({ type, close, submit, users, queue, stock, specialties }) {
  const labels = {
    user: 'Crear usuario',
    specialty: 'Agregar especialidad',
    appointment: 'Reservar turno',
    reschedule: 'Reprogramar',
    inventory: 'Ingresar al inventario',
    prescription: 'Emitir receta electrónica',
    procedure: 'Registrar procedimiento'
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <section className="appointment-modal" role="dialog" aria-modal="true">
        <div className="modal-heading">
          <button className="icon-button" onClick={close}>
            <Icon name="close" />
          </button>
          <h2>{labels[type]}</h2>
        </div>
        <form onSubmit={submit}>
          {type === 'user' && (
            <>
              <label>
                Nombre
                <input name="name" required />
              </label>
              <label>
                Correo
                <input name="email" type="email" required />
              </label>
              <label>
                Rol
                <select name="role">
                  {roles.map(([id, label]) => (
                    <option key={id}>{label}</option>
                  ))}
                </select>
              </label>
            </>
          )}
          {type === 'specialty' && (
            <label>
              Especialidad Médica
              <input name="name" required />
            </label>
          )}
          {type === 'appointment' && (
            <>
              <label>
                Nombre del Paciente
                <input name="patient" required />
              </label>
              <label>
                Especialidad
                <select name="specialty">
                  {specialties.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Fecha
                <input name="date" type="date" required />
              </label>
              <label>
                Hora
                <input name="time" type="time" required />
              </label>
            </>
          )}
          {type === 'reschedule' && (
            <label>
              Nuevo horario
              <input name="time" type="time" required />
            </label>
          )}
          {type === 'inventory' && (
            <>
              <label>
                Fármaco
                <input name="name" required />
              </label>
              <label>
                Unidades
                <input name="qty" type="number" min="1" required />
              </label>
              <label>
                Vencimiento
                <input name="expiry" type="date" required />
              </label>
            </>
          )}
          {type === 'prescription' && (
            <>
              <label>
                Paciente
                <select name="patient">
                  {queue.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Seleccionar Fármaco (Inventario)
                <input
                  name="medicine"
                  list="medicine-catalog"
                  autoComplete="off"
                  required
                  placeholder="Buscar..."
                />
                <datalist id="medicine-catalog">
                  {stock.map((i) => (
                    <option key={i.name} value={i.name}>
                      {i.qty} unidades disponibles
                    </option>
                  ))}
                </datalist>
              </label>
              <div className="form-row">
                <label>
                  Dosis
                  <input name="dose" required placeholder="Ej: 500 mg" />
                </label>
                <label>
                  Indicaciones
                  <input
                    name="instructions"
                    required
                    placeholder="Ej: Cada 8 hrs"
                  />
                </label>
              </div>
              <p className="form-helper">
                Al guardar, se descontará de farmacia cuando el paciente lo
                retire.
              </p>
            </>
          )}
          {type === 'procedure' && (
            <>
              <label>
                Tipo de procedimiento
                <select name="type" required>
                  <option value="">Seleccionar...</option>
                  <option>Curación</option>
                  <option>Inyección intramuscular</option>
                  <option>Toma de muestra</option>
                  <option>Vendaje</option>
                  <option>Otros</option>
                </select>
              </label>
              <label>
                Observaciones
                <textarea name="notes" rows="3" placeholder="Detalle del procedimiento..." />
              </label>
            </>
          )}
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={close}>
              Cancelar
            </button>
            <button className="primary-button">Guardar y Procesar</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useStored('session', null)
  const login = (nextSession) => {
    localStorage.setItem('vitacare:jwt', nextSession.token)
    setSession(nextSession)
  }
  const logout = () => {
    localStorage.removeItem('vitacare:jwt')
    setSession(null)
  }
  return session?.token ? (
    <Dashboard session={session} logout={logout} />
  ) : (
    <Login onLogin={login} />
  )
}