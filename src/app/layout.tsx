import './globals.css'
import Link from 'next/link'
import { Users, FileText, Clock, CalendarDays, Banknote, LayoutDashboard, CalendarClock, Layers, Receipt } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import LogoutButton from './components/LogoutButton'

export const metadata = { title: 'PeoplePay360 | HR & Payroll' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role

  // Role Access Booleans
  const isEmployee = role === 'Employee'
  const hasHRAccess = ['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(role)
  const hasPayrollAccess = ['HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(role)

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {session && (
          <div className="app-shell">
            <aside className="app-sidebar">
              <Link href="/" className="brand"><span className="brand-mark">360</span> PEOPLEPAY</Link>
              <nav>
                <Link href="/" className="nav-link"><LayoutDashboard size={17} /> Dashboard</Link>

                {/* HR Master Data Access */}
                {hasHRAccess && (
                  <>
                    <Link href="/employees" className="nav-link"><Users size={17} /> Employees</Link>
                    <Link href="/contracts" className="nav-link"><FileText size={17} /> Contracts</Link>
                    <Link href="/schedules" className="nav-link"><CalendarClock size={17} /> Schedules</Link>
                    <Link href="/attendance" className="nav-link"><Clock size={17} /> Attendance</Link>
                  </>
                )}
                {isEmployee && <Link href="/attendance" className="nav-link"><Clock size={17} /> My Attendance</Link>}

                {/* Global Access for Time Off */}
                <Link href="/time-off/requests" className="nav-link"><CalendarDays size={17} /> Time Off</Link>

                {/* Payroll Engine Access */}
                {hasPayrollAccess && (
                  <>
                    <Link href="/payroll/payruns" className="nav-link"><Banknote size={17} /> Payroll</Link>
                    <Link href="/payroll/payslips" className="nav-link"><Receipt size={17} /> Payslips</Link>
                    <Link href="/payroll/structures" className="nav-link"><Layers size={17} /> Salary Structures</Link>
                  </>
                )}
              </nav>
              <div className="sidebar-user">
                <p className="text-sm font-bold text-white">{session.user?.name}</p>
                <p className="text-[10px] text-violet-300 uppercase tracking-wider mb-3">{role}</p>
                <LogoutButton />
              </div>
            </aside>
            <main className="app-content">{children}</main>
          </div>
        )}
        {!session && <main>{children}</main>}
      </body>
    </html>
  )
}
