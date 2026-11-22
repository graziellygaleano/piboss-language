import { StyleSheet } from 'react-native';
import { responsiveSize } from '@/utils/responsive';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a4d955',
    gap: responsiveSize(14, 22),
  },
  logo: {
    width: responsiveSize(350, 520),
    height: responsiveSize(250, 360),
  },
  playButton: {
    width: responsiveSize(92, 140),
    height: responsiveSize(92, 140),
    shadowColor: '#304F0E',
    shadowOffset: { width: 0, height: responsiveSize(5, 8) },
    shadowOpacity: 0.45,
    shadowRadius: 0,
    elevation: 8,
  },
});
