import React from 'react';
import { View, StyleSheet } from 'react-native';
import GridCard from './GridCard';

export default function DashboardGrid() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <GridCard title="Total Products" value="120" icon="cube-outline" onPress={() => {}} />
        <GridCard title="Low Stock" value="8" icon="alert-circle-outline" onPress={() => {}} />
      </View>

      <View style={styles.row}>
        <GridCard title="Total Value" value="₱25,000" icon="cash-outline" onPress={() => {}} />
        <GridCard title="Categories" value="6" icon="grid-outline" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});