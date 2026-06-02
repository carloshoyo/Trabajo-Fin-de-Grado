/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    blurStyle: "dark",
    text: '#333333',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    formTextArea: '#E6E6E6',
    formBorderColor: '#999999',
    formButtonColor: '#4D4D4D',
    formTextColor: '#333333',
    flatCardBackground: '#D9D9D9',
    flatCardBorderColor: '#999999',
    navBorderColor: '#E6E6E6',
    postAdTextColor: '#484848',
    postAdContainerColor: '#B3B3B3',
    postAdInput: '#E6E6E6',
    postAdInputTextColor: '#999999',
    postAdBorderColor: '#999999',
    postAdClose: '#484848',
    postAdContinueColor: '#4D4D4D',
    adViewInputColor: '#E6E6E6',
    placeholderColor: '#999999',
    declineRequest: '#8d0000',
    acceptRequest: '#019b01',
    notificationsColor: '#f00',
    shadowColor: '#000',
    highScoringColorContainer: 'rgb(21, 158, 87)',
    highScoringColorText: 'rgb(44, 243, 140)',
    midScoringColorContainer: 'rgb(236, 174, 41)',
    midScoringColorText: 'rgb(145, 111, 25)',
    lowScoringColorContainer: 'rgb(147, 46, 46)',
    lowScoringColorText: 'rgb(255, 0, 0)',
    imgSource: require('../assets/images/LogoFondoBlanco.png'),
    imgSource2: require('../assets/images/LogoFondoBlancoPequeño.png')
  },
  dark: {
    blurStyle: "light",
    text: '#000',
    background: '#000',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    formTextArea: '#333333',
    formBorderColor: '#4d4d4d',
    formButtonColor: '#999999',
    formTextColor: '#E6E6E6',
    flatCardBackground: '#3C3C3C',
    flatCardBorderColor: '#6e6e6e',
    navBorderColor: '#1f1f1f',
    postAdTextColor: '#D4D4D4',
    postAdContainerColor: '#383838',
    postAdInput: '#6b6a6a',
    postAdInputTextColor: '#2b2a2a',
    postAdBorderColor: '#151515',
    postAdClose: '#151515',
    postAdContinueColor: '#6b6a6a',
    adViewInputColor: '#2b2a2a',
    placeholderColor: '#999999',
    declineRequest: '#a90000',
    acceptRequest: '#01b401',
    notificationsColor: '#f00',
    shadowColor: '#ffffff00',
    highScoringColorContainer: 'rgb(21, 158, 87)',
    highScoringColorText: 'rgb(16, 86, 50)',
    midScoringColorContainer: 'rgb(158, 119, 21)',
    midScoringColorText: 'rgb(86, 71, 16)',
    lowScoringColorContainer: 'rgb(158, 21, 21)',
    lowScoringColorText: 'rgb(86, 16, 16)',
    imgSource: require('../assets/images/LogoFondoNegro.png'),
    imgSource2: require('../assets/images/LogoFondoNegroPequeño.png')
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
