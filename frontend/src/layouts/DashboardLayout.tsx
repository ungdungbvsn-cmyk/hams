import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Monitor, Wrench, LogOut, Building2, Building, Users, Database, Clock, ChevronDown, ClipboardList, Box, ShieldCheck, UserCog, Trash2, Activity, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

import { AIChatBubble } from '../components/AIChatBubble';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { Lock } from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({'Quản lý danh mục': true, 'Chấm công': true});
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleMenu = (label: string) => setOpenMenus(prev => ({...prev, [label]: !prev[label]}));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hasPermission = (permissionKey: string) => {
    if (user?.role?.name?.toUpperCase() === 'ADMIN') return true;
    if (!user || !user.permissions) return false;
    return (user.permissions as any)[permissionKey] === true;
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Tài sản & Thiết bị', path: '/assets', icon: <Monitor size={20} /> },
    hasPermission('accessLiquidation') && { label: 'Thanh lý', path: '/liquidations', icon: <Trash2 size={20} /> },
    hasPermission('accessMaintenance') && { label: 'Sửa chữa - Bảo trì', path: '/maintenances', icon: <Wrench size={20} /> },
    hasPermission('accessMaintenance') && { label: 'Kiểm định', path: '/calibration', icon: <ShieldCheck size={20} /> },
    user?.role?.name?.toUpperCase() === 'ADMIN' && { label: 'Nhật ký hệ thống', path: '/activity-logs', icon: <Activity size={20} /> },
    user?.role?.name?.toUpperCase() === 'ADMIN' && { label: 'Sao lưu dữ liệu', path: '/backups', icon: <Database size={20} /> },
    { 
      label: 'Chấm công', 
      icon: <ClipboardList size={20} />,
      children: [
        { label: 'DashboardCC', path: '/timekeeping/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'Chấm công ngày', path: '/timekeeping', icon: <Clock size={18} /> },
        { label: 'Timeline', path: '/timekeeping/timeline', icon: <LayoutDashboard size={18} /> },
      ]
    },
    (() => {
      const children = [
        hasPermission('manageEmployees') && { label: 'Nhân viên', path: '/employees', icon: <Users size={18} /> },
        hasPermission('manageSuppliers') && { label: 'Nhà cung cấp', path: '/suppliers', icon: <Building2 size={18} /> },
        hasPermission('manageDepartments') && { label: 'Khoa phòng', path: '/departments', icon: <Building size={18} /> },
        hasPermission('manageEquipmentTypes') && { label: 'Loại thiết bị', path: '/equipment-types', icon: <Box size={18} /> },
        hasPermission('manageAssetStatuses') && { label: 'Tình trạng', path: '/asset-statuses', icon: <Activity size={18} /> },
        hasPermission('manageTimekeepingSymbols') && { label: 'Ký hiệu chấm công', path: '/timekeeping-symbols', icon: <Clock size={18} /> },
        hasPermission('manageUsers') && { label: 'Người dùng', path: '/users', icon: <UserCog size={18} /> },
      ].filter(Boolean);
      return children.length > 0 ? {
        label: 'Quản lý danh mục',
        icon: <Database size={20} />,
        children
      } : null;
    })()
  ].filter(Boolean) as any[];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static fixed inset-y-0 left-0 print:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">HAMS</h1>
          <button className="lg:hidden p-2 text-gray-400 hover:text-red-500 transition" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            item.children ? (
              <div key={item.label} className="space-y-1">
                <button 
                  onClick={() => toggleMenu(item.label)}
                  className={clsx(
                    "flex items-center justify-between w-full p-3 rounded-xl transition duration-200 ease-in-out font-medium",
                    "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-primary">{item.icon}</div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown size={16} className={clsx("transition-transform duration-200 text-gray-400", openMenus[item.label] && "rotate-180")} />
                </button>
                
                {openMenus[item.label] && (
                  <div className="pl-6 space-y-1 mt-1">
                    {item.children.map((child: any) => (
                      <Link 
                        key={child.path} 
                        to={child.path} 
                        onClick={() => setIsSidebarOpen(false)}
                        className={clsx(
                          "flex items-center gap-3 p-2.5 rounded-xl transition duration-200 ease-in-out text-sm font-medium",
                          location.pathname === child.path 
                            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light" 
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100"
                        )}
                      >
                        <div className={clsx(location.pathname === child.path && "text-primary dark:text-primary-light")}>{child.icon}</div>
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link 
                key={item.path} 
                to={item.path!} 
                onClick={() => setIsSidebarOpen(false)}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-xl transition duration-200 ease-in-out font-medium",
                  location.pathname === item.path 
                    ? "bg-primary text-white shadow-md shadow-primary/30" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                <div className={clsx(location.pathname === item.path ? 'text-white' : 'text-primary')}>{item.icon}</div>
                <span>{item.label}</span>
              </Link>
            )
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <div className="mb-4 px-2 space-y-1">
            <p className="font-bold text-sm truncate">{user?.employee?.fullName || user?.username}</p>
            <p className="text-xs text-primary font-medium tracking-wide uppercase">{user?.role?.name}</p>
            <button 
              onClick={() => { setIsChangePasswordOpen(true); setIsSidebarOpen(false); }}
              className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-primary transition font-bold"
            >
              <Lock size={10} /> Đổi mật khẩu
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full text-left font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition duration-200"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
        <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative print:overflow-visible">
        <header className="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center px-4 lg:px-8 shadow-sm z-30 sticky top-0 print:hidden">
          <button 
            className="lg:hidden p-2.5 mr-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-primary shadow-sm hover:scale-105 transition-all"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h2 className="text-sm lg:text-lg font-bold tracking-tight text-gray-900 dark:text-white uppercase px-3 py-1 rounded-lg">Hệ thống Quản lý Thiết bị - Chấm công</h2>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8 relative print:p-0">
          <Outlet />
        </div>
      </main>

      <div className="print:hidden">
        <AIChatBubble />
      </div>
    </div>
  );
};
