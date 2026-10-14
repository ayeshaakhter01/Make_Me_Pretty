import { Link } from 'react-router-dom'

const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:pointer-events-none disabled:opacity-50'
const variants = {
  primary: 'bg-ink text-white hover:bg-rose-deep',
  rose: 'bg-rose text-white hover:bg-rose-deep',
  outline: 'border border-ink/20 bg-transparent text-ink hover:border-rose hover:text-rose-deep',
  soft: 'bg-rose-soft text-rose-deep hover:bg-[#efd0d6]',
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  return <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>{children}</button>
}

export function ButtonLink({ to, variant = 'primary', className = '', children, ...props }) {
  return <Link to={to} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>{children}</Link>
}
