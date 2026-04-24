import NetInfo from '@react-native-community/netinfo';

export const networkService = {
  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  },

  onConnectivityChange(callback: (isConnected: boolean) => void): () => void {
    const unsubscribe = NetInfo.addEventListener(state => {
      callback(state.isConnected ?? false);
    });
    
    return unsubscribe;
  }
};
