import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type NavItem = 'Home' | 'Products' | 'Inventory' | 'Users';

interface Props {
  active: NavItem;
}

export default function BottomNavBar({ active }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.tabBar}>
        {/* LEFT SIDE */}
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons
            name="home"
            size={24}
            color={active === 'Home' ? '#1e40af' : '#9CA3AF'}
          />
          <Text style={[styles.tabLabel, active === 'Home' && styles.activeText]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons
            name="cube-outline"
            size={24}
            color={active === 'Products' ? '#1e40af' : '#9CA3AF'}
          />
          <Text
            style={[styles.tabLabel, active === 'Products' && styles.activeText]}
          >
            Products
          </Text>
        </TouchableOpacity>

        {/* SPACE FOR CENTER BUTTON */}
        <View style={{ width: 70 }} />

        {/* RIGHT SIDE */}
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons
            name="cube"
            size={24}
            color={active === 'Inventory' ? '#1e40af' : '#9CA3AF'}
          />
          <Text
            style={[styles.tabLabel, active === 'Inventory' && styles.activeText]}
          >
            Inventory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons
            name="people"
            size={24}
            color={active === 'Users' ? '#1e40af' : '#9CA3AF'}
          />
          <Text
            style={[styles.tabLabel, active === 'Users' && styles.activeText]}
          >
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {/* FLOATING SCANNER BUTTON */}
      <TouchableOpacity style={styles.scanButton}>
        <MaterialCommunityIcons name="barcode-scan" size={28} color="#000000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'visible', // 👈 ADD THIS
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 10,
    paddingBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#9CA3AF',
  },

  activeText: {
    color: '#1e40af',
    fontWeight: '600',
  },

  scanButton: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',

    // Shadow iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,

    // Shadow Android
    elevation: 10,
  },
});