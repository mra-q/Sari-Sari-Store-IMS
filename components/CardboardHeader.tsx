import { StyleSheet, Text, View, Image, Platform, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { router, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { getRoleLabel, getUserDisplayName } from '@/utils/helpers';

interface CardboardHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  showFilter?: boolean;
  onFilterPress?: () => void;
  showGreeting?: boolean;
  userName?: string;
  storeName?: string;
}

export default function CardboardHeader({
  title = '',
  showGreeting = false,
  storeName = '',
}: CardboardHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout, user } = useAuth();
  const { role, isOwner, isStaff } = useUserRole();
  const segments = useSegments();

  const displayName = getUserDisplayName(user);
  const roleLabel = useMemo(() => getRoleLabel(role).toUpperCase(), [role]);
  const initials = useMemo(() => {
    const parts = displayName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }, [displayName]);

  const resolveProfileRoute = () => {
    if ((segments as string[]).includes('(owner)')) {
      return '/(owner)/profile';
    }
    if ((segments as string[]).includes('(staff)')) {
      return '/(staff)/profile';
    }
    if (isOwner) {
      return '/(owner)/profile';
    }
    if (isStaff) {
      return '/(staff)/profile';
    }
    return '/(owner)/profile';
  };

  const closeMenu = () => setMenuVisible(false);

  const menuItems = useMemo(() => {
    if (isOwner || (segments as string[]).includes('(owner)')) {
      return [
        { label: 'Dashboard', icon: 'home-outline', route: '/(owner)' },
        { label: 'Inventory', icon: 'cube-outline', route: '/(owner)/inventory' },
        { label: 'Products', icon: 'grid-outline', route: '/(owner)/product-management' },
        { label: 'Staff', icon: 'people-outline', route: '/(owner)/staff' },
        { label: 'Reports', icon: 'bar-chart-outline', route: '/(owner)/reports' },
        { label: 'Profile', icon: 'person-outline', route: '/(owner)/profile' },
      ];
    }

    return [
      { label: 'Inventory', icon: 'cube-outline', route: '/(staff)/inventory' },
      { label: 'Low Stock', icon: 'alert-circle-outline', route: '/(staff)/low-stock' },
      { label: 'Scan', icon: 'scan-outline', route: '/(staff)/scan' },
      { label: 'Profile', icon: 'person-outline', route: '/(staff)/profile' },
    ];
  }, [isOwner, segments]);

  const currentRouteKey = useMemo(() => `/${(segments as string[]).join('/')}`, [segments]);

  const isActiveRoute = (route: string) => {
    const normalizedRoute = route === '/(owner)' ? '/(owner)/index' : route;
    const normalizedCurrent = currentRouteKey === '/(owner)' ? '/(owner)/index' : currentRouteKey;

    if (normalizedCurrent === normalizedRoute) {
      return true;
    }

    if (route === '/(owner)' && normalizedCurrent.startsWith('/(owner)')) {
      return normalizedCurrent === '/(owner)/index';
    }

    return normalizedCurrent.startsWith(`${normalizedRoute}/`);
  };

  const handleMenuPress = (route: string) => {
    closeMenu();
    router.push(route as any);
  };

  const handleViewProfile = () => {
    closeMenu();
    router.push(resolveProfileRoute());
  };

  const handleLogout = async () => {
    closeMenu();
    await logout();
    router.replace('/(auth)/login');
  };

  const hasTitle = title.trim().length > 0;
  const showGreetingInTopRow = showGreeting && !hasTitle;

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={26} color="white" />
          </TouchableOpacity>
          {hasTitle ? (
            <Text style={styles.title}>{title}</Text>
          ) : showGreetingInTopRow ? (
            <View style={styles.inlineGreetingContent}>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>WELCOME BACK</Text>
                <Text style={styles.greetingEmoji}>👋</Text>
              </View>
              <View style={styles.storeNameBadge}>
                <Ionicons name="storefront" size={16} color="#60A5FA" />
                <Text style={styles.storeNameText}>{storeName}</Text>
              </View>
            </View>
          ) : null}
        </View>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/inv-icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <TouchableOpacity
              style={styles.menuProfile}
              onPress={handleViewProfile}
            >
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarTextLarge}>{initials}</Text>
              </View>
              <View style={styles.menuProfileText}>
                <Text style={styles.menuProfileName} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.menuProfileRole}>{roleLabel}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            {menuItems.map((item) => {
              const active = isActiveRoute(item.route);

              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.menuItem, active && styles.menuItemActive]}
                  onPress={() => handleMenuPress(item.route)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={active ? '#2B3A7E' : '#374151'}
                  />
                  <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text style={[styles.menuItemText, styles.logoutText]}>
                Logout
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2B3A7E',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 18 : 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  logoContainer: {
    width: 34,
    height: 34,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '82%',
    height: '82%',
  },
  title: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingHorizontal: 16,
  },
  menuCard: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    width: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  menuProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextLarge: {
    color: '#2B3A7E',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  menuProfileText: {
    flex: 1,
  },
  menuProfileName: {
    color: '#111827',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  menuProfileRole: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'Poppins_500Medium',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: '#EEF4FF',
  },
  menuItemText: {
    color: '#1f2937',
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  menuItemTextActive: {
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  logoutText: {
    color: '#DC2626',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 12,
  },
  inlineGreetingContent: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greeting: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 1.5,
  },
  greetingEmoji: {
    fontSize: 12,
  },
  storeNameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  storeNameText: {
    color: '#93C5FD',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
});
