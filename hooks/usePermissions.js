import { useAuth } from '@/context/AuthContext';

const rolePermissions = {
  admin: ['view_inventory', 'edit_product', 'delete_product', 'update_stock', 'update_price', 'manage_categories', 'manage_users', 'view_reports', 'scan_barcode'],
  owner: ['view_inventory', 'view_reports'],
  staff: ['view_inventory', 'update_stock', 'scan_barcode'],
};

export const usePermissions = () => {
  const { role } = useAuth();

  const hasPermission = (permission) => {
    if (!role) return false;
    return rolePermissions[role]?.includes(permission) || false;
  };

  return {
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
  };
};
