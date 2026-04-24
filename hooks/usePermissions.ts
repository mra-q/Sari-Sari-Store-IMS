import { useMemo } from 'react';
import { useUserRole } from '@/hooks/useUserRole';

type Permission =
  | 'view_inventory'
  | 'edit_product'
  | 'delete_product'
  | 'update_stock'
  | 'update_price'
  | 'manage_categories'
  | 'manage_users'
  | 'view_reports'
  | 'scan_barcode'
  | 'stock_adjustment'
  | 'view_activity_log'
  | 'cycle_count'
  | 'request_restock'
  | 'manage_restock_requests';

const rolePermissions: Record<string, Permission[]> = {
  owner: [
    'view_inventory',
    'view_reports',
    'manage_users',
    'update_stock',
    'edit_product',
    'delete_product',
    'update_price',
    'manage_categories',
    'scan_barcode',
    'stock_adjustment',
    'view_activity_log',
    'cycle_count',
    'request_restock',
    'manage_restock_requests',
  ],
  staff: [
    'view_inventory',
    'update_stock',
    'scan_barcode',
    'stock_adjustment',
    'view_activity_log',
    'cycle_count',
    'request_restock',
  ],
};

export const usePermissions = () => {
  const { role } = useUserRole();

  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false;
    return rolePermissions[role]?.includes(permission) ?? false;
  };

  return useMemo(() => ({
    hasPermission,
    canEditProduct: () => hasPermission('edit_product'),
    canDeleteProduct: () => hasPermission('delete_product'),
    canUpdateStock: () => hasPermission('update_stock'),
    canUpdatePrice: () => hasPermission('update_price'),
    canManageCategories: () => hasPermission('manage_categories'),
    canManageUsers: () => hasPermission('manage_users'),
    canManageStaff: () => hasPermission('manage_users'),
    canViewReports: () => hasPermission('view_reports'),
    canScanBarcode: () => hasPermission('scan_barcode'),
    canAdjustStock: () => hasPermission('stock_adjustment'),
    canViewActivityLog: () => hasPermission('view_activity_log'),
    canCycleCount: () => hasPermission('cycle_count'),
    canRequestRestock: () => hasPermission('request_restock'),
    canManageRestockRequests: () => hasPermission('manage_restock_requests'),
  }), [role]);
};
