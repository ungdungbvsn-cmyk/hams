import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AssetList } from './pages/AssetList';
import { AssetDetail } from './pages/AssetDetail';
import { TicketList } from './pages/TicketList';
import { MovementList } from './pages/MovementList';
import { SupplierList } from './pages/SupplierList';
import { DepartmentList } from './pages/DepartmentList';
import { EmployeeList } from './pages/EmployeeList';
import { MaintenanceList } from './pages/MaintenanceList';
import { TimekeepingSymbolList } from './pages/TimekeepingSymbolList';
import { TimekeepingList } from './pages/TimekeepingList';
import { EquipmentTypeList } from './pages/EquipmentTypeList';
import { CalibrationList } from './pages/CalibrationList';
import { TimekeepingTimeline } from './pages/TimekeepingTimeline';
import { TimekeepingDashboard } from './pages/TimekeepingDashboard';
import { UserList } from './pages/UserList';
import { LiquidationList } from './pages/LiquidationList';
import { StatusList } from './pages/StatusList';
import { ActivityLogList } from './pages/ActivityLogList';
import { BackupSettings } from './pages/BackupSettings';

const NotFound = () => <div className="flex h-screen items-center justify-center text-2xl text-red-500">404 - Not Found</div>;

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<AssetList />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="tickets" element={<TicketList />} />
          <Route path="maintenances" element={<MaintenanceList />} />
          <Route path="movements" element={<MovementList />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="suppliers" element={<SupplierList />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="timekeeping-symbols" element={<TimekeepingSymbolList />} />
          <Route path="timekeeping" element={<TimekeepingList />} />
          <Route path="timekeeping/timeline" element={<TimekeepingTimeline />} />
          <Route path="timekeeping/dashboard" element={<TimekeepingDashboard />} />
          <Route path="equipment-types" element={<EquipmentTypeList />} />
          <Route path="calibration" element={<CalibrationList />} />
          <Route path="liquidations" element={<LiquidationList />} />
          <Route path="asset-statuses" element={<StatusList />} />
          <Route path="activity-logs" element={<ActivityLogList />} />
          <Route path="backups" element={<BackupSettings />} />
          <Route path="users" element={<UserList />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
