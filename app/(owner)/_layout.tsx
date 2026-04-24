import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type OwnerTabName = 'index' | 'inventory' | 'scan';

interface OwnerTabConfig {
  name: OwnerTabName;
  label: string;
}

const ownerTabs: OwnerTabConfig[] = [
  { name: 'index', label: 'Dashboard' },
  { name: 'inventory', label: 'Inventory' },
];

export default function OwnerLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <OwnerTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="inventory" />
      <Tabs.Screen name="scan" />
      {/* Non-tab screens — hidden from tab bar */}
      <Tabs.Screen name="stock-adjustment" options={{ href: null }} />
      <Tabs.Screen name="activity-log" options={{ href: null }} />
      <Tabs.Screen name="purchase-orders" options={{ href: null }} />
      <Tabs.Screen name="add-product" options={{ href: null }} />
      <Tabs.Screen name="edit-product" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="inventory-reports" options={{ href: null }} />
      <Tabs.Screen name="staff" options={{ href: null }} />
      <Tabs.Screen name="invite-staff" options={{ href: null }} />
      <Tabs.Screen name="low-stock" options={{ href: null }} />
      <Tabs.Screen name="product-management" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="cycle-count" options={{ href: null }} />
      <Tabs.Screen name="restock-requests" options={{ href: null }} />
    </Tabs>
  );
}

function OwnerTabBar({ state, navigation }: BottomTabBarProps) {
  const activeRouteName = state.routes[state.index]?.name as OwnerTabName;

  const navigate = (name: OwnerTabName) => {
    if (activeRouteName === name) return;
    navigation.navigate(name as never);
  };

  const iconColor = (name: OwnerTabName) => (activeRouteName === name ? '#9CA3AF' : '#FFFFFF');

  const renderIcon = (name: OwnerTabName) => {
    const color = iconColor(name);
    if (name === 'inventory') return <Ionicons name="cube" size={23} color={color} />;
    return <Ionicons name="home" size={23} color={color} />;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigate(ownerTabs[0].name)}>
          {renderIcon(ownerTabs[0].name)}
          <Text style={[styles.tabLabel, { color: iconColor(ownerTabs[0].name) }]}>
            {ownerTabs[0].label}
          </Text>
        </TouchableOpacity>
        <View style={styles.centerSpace} />
        <TouchableOpacity style={styles.tabItem} onPress={() => navigate(ownerTabs[1].name)}>
          {renderIcon(ownerTabs[1].name)}
          <Text style={[styles.tabLabel, { color: iconColor(ownerTabs[1].name) }]}>
            {ownerTabs[1].label}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.scanButton, activeRouteName === 'scan' && styles.scanButtonActive]}
        activeOpacity={0.85}
        onPress={() => navigate('scan')}
      >
        <MaterialCommunityIcons name="barcode-scan" size={34} color="#000000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  tabBar: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#2B3A7E',
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    fontFamily: 'Poppins_500Medium',
  },
  centerSpace: { width: 90 },
  scanButton: {
    position: 'absolute',
    top: -36,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  scanButtonActive: { backgroundColor: '#E6EEFF' },
});
