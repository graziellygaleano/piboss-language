import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const minDimension = Math.min(width, height);

export const isTablet = minDimension >= 600;

export function responsiveSize(phoneSize: number, tabletSize?: number): number {
  if (isTablet) {
    return tabletSize ?? Math.round(phoneSize * 1.45);
  }
  return phoneSize;
}

export function responsiveFont(phoneFontSize: number, tabletFontSize?: number): number {
  if (isTablet) {
    return tabletFontSize ?? Math.round(phoneFontSize * 1.35);
  }
  return phoneFontSize;
}
