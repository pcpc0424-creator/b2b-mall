import { Outlet } from 'react-router-dom'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'
import { useAdminStore } from '../../store/adminStore'
import { cn } from '../../../lib/utils'

export function AdminLayout() {
  const { isSidebarCollapsed, isMobileSidebarOpen, setMobileSidebarOpen } = useAdminStore()

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <AdminSidebar />
      <div
        className={cn(
          'transition-all duration-300',
          // Desktop: margin based on sidebar state
          'lg:ml-64',
          isSidebarCollapsed && 'lg:ml-16',
          // Mobile: no margin
          'ml-0'
        )}
      >
        <AdminHeader />
        <main className="p-3 sm:p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
