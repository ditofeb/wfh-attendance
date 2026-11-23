import { createBrowserRouter, Navigate } from 'react-router'
import { useAuth } from './context/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import { ClockInPage } from './pages/ClockInPage'
import { AttendanceMonitorPage } from './pages/hr/AttendanceMonitorPage'
import { EmployeeFormPage } from './pages/hr/EmployeeFormPage'
import { EmployeesPage } from './pages/hr/EmployeesPage'
import { LoginPage } from './pages/LoginPage'
import { MyAttendancePage } from './pages/MyAttendancePage'
import { homePathFor } from './routes/home'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { Role } from './types/api'

function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <HomeRedirect /> },
          { path: '/clock-in', element: <ClockInPage /> },
          { path: '/my-attendance', element: <MyAttendancePage /> },
          {
            element: <ProtectedRoute roles={[Role.HR]} />,
            children: [
              { path: '/hr/employees', element: <EmployeesPage /> },
              { path: '/hr/employees/new', element: <EmployeeFormPage key="new" /> },
              { path: '/hr/employees/:id', element: <EmployeeFormPage key="edit" /> },
              { path: '/hr/attendance', element: <AttendanceMonitorPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
