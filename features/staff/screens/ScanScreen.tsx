import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CardboardHeader from '@/components/CardboardHeader';
import ScanSession from '@/features/shared/components/ScanSession';

type ScanMode = 'single' | 'bulk';

export default function StaffScanScreen() {
  const [mode, setMode] = useState<ScanMode>('single');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CardboardHeader />
      <ScanSession mode={mode} onModeChange={setMode} allowAddProduct={false} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
});
