import { Bell, Search, Menu } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { cn } from '../../../lib/utils'

export function AdminHeader() {
  const { adminUser, isSidebarCollapsed, setMobileSidebarOpen } = useAdminStore()

  return (
    <header className="sticky top-0 z-20 h-14 lg:h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-3 sm:px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-2 -ml-1 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-xs sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="검색..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button className="relative p-1.5 sm:p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-error rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-neutral-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-medium text-primary-600">
              {adminUser?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-neutral-900">{adminUser?.name || '관리자'}</p>
            <p className="text-xs text-neutral-500">
              {adminUser?.role === 'super_admin' ? '최고관리자' :
               adminUser?.role === 'admin' ? '관리자' : '매니저'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
