import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import ScanSession from '@/features/shared/components/ScanSession';

type ScanMode = 'single' | 'bulk';

export default function OwnerScanScreen() {
  const [mode, setMode] = useState<ScanMode>('single');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Scan Barcode" />
      <ScanSession mode={mode} onModeChange={setMode} allowAddProduct />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
});
