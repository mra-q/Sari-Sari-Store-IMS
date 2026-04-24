import { StyleSheet, Text, TextInput, View, Image, Platform, TouchableOpacity, Modal } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

interface AppHeaderProps {
  title: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

export default function AppHeader({
  title,
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  showFilter = false,
  onFilterPress,
}: AppHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout, user } = useAuth();

  const menuItems = [
    { label: 'Dashboard', icon: 'home-outline', route: user?.role === 'owner' ? '/(owner)/dashboard' : '/(staff)/inventory' },
    { label: 'Products', icon: 'cube-outline', route: user?.role === 'owner' ? '/(owner)/product-management' : '/(staff)/inventory' },
    ...(user?.role === 'owner' ? [
      { label: 'Staff Management', icon: 'people-outline', route: '/(owner)/staff' },
      { label: 'Reports', icon: 'bar-chart-outline', route: '/(owner)/reports' },
    ] : []),
    { label: 'Profile', icon: 'person-outline', route: user?.role === 'owner' ? '/(owner)/profile' : '/(staff)/profile' },
  ];

  const handleMenuPress = (route: string) => {
    setMenuVisible(false);
    router.push(route as any);
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={26} color="white" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/inv-icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>

      {showSearch && (
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor="#9ca3af"
              value={searchValue}
              onChangeText={onSearchChange}
            />
            {searchValue.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange?.('')}>
                <Ionicons name="close-circle" size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {showFilter && (
            <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
              <Feather name="filter" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuDrawer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.route)}
              >
                <Ionicons name={item.icon as any} size={22} color="#374151" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#DC2626" />
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2B3A7E',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: Platform.OS === 'ios' ? 24 : 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '82%',
    height: '82%',
  },
  title: {
    color: 'white',
    fontSize: 26,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontFamily: 'Poppins_400Regular',
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  menuDrawer: {
    backgroundColor: 'white',
    width: 280,
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#374151',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  logoutText: {
    color: '#DC2626',
  },
});
