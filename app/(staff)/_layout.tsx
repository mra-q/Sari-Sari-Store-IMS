import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type StaffTabName = 'inventory' | 'low-stock' | 'scan';

interface StaffTabConfig {
  name: StaffTabName;
  label: string;
}

const staffTabs: StaffTabConfig[] = [
  { name: 'inventory', label: 'Inventory' },
  { name: 'low-stock', label: 'Low Stock' },
];

export default function StaffLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      initialRouteName="inventory"
      tabBar={(props) => <StaffTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="inventory" />
      <Tabs.Screen name="low-stock" />
      <Tabs.Screen name="scan" />
      {/* Non-tab screens */}
      <Tabs.Screen name="stock-adjustment" options={{ href: null }} />
      <Tabs.Screen name="activity-log" options={{ href: null }} />
      <Tabs.Screen name="update-stock" options={{ href: null }} />
      <Tabs.Screen name="scan-product" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="cycle-count" options={{ href: null }} />
    </Tabs>
  );
}

function StaffTabBar({ state, navigation }: BottomTabBarProps) {
  const activeRouteName = state.routes[state.index]?.name as StaffTabName;

  const navigate = (name: StaffTabName) => {
    if (activeRouteName === name) return;
    navigation.navigate(name as never);
  };

  const iconColor = (name: StaffTabName) => (activeRouteName === name ? '#9CA3AF' : '#FFFFFF');

  const renderIcon = (name: StaffTabName) => {
    const color = iconColor(name);
    if (name === 'inventory') return <Ionicons name="cube" size={23} color={color} />;
    if (name === 'low-stock') return <Ionicons name="alert-circle" size={23} color={color} />;
    return <MaterialCommunityIcons name="barcode-scan" size={24} color={color} />;
  };

  const renderTab = (tab: StaffTabConfig) => (
    <TouchableOpacity key={tab.name} style={styles.tabItem} onPress={() => navigate(tab.name)}>
      {renderIcon(tab.name)}
      <Text style={[styles.tabLabel, { color: iconColor(tab.name) }]}>{tab.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabBar}>
        {renderTab(staffTabs[0])}
        <View style={styles.centerSpace} />
        {renderTab(staffTabs[1])}
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
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, marginTop: 3, fontFamily: 'Poppins_500Medium' },
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
