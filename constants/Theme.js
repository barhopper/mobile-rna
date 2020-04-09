/**
 * This is the main colors for the UI Kitten Theme,
 * controls the branding and colors
 *
 * For More information check out
 * https://akveo.github.io/react-native-ui-kitten/docs/guides/branding
 * https://colors.eva.design/
 *
 */
import {default as eva} from '@eva-design/eva'

export const myTheme = {
  ...eva,

  /**
   *  This section is the basic branding and colors
   *  Primary, Success, Info, Warning, Danger
   */
  'color-primary-100': '#FCDFD5',
  'color-primary-200': '#F9B8AC',
  'color-primary-300': '#ED877F',
  'color-primary-400': '#DB5C5F',
  'color-primary-500': '#C42D3E',
  'color-primary-600': '#A8203C',
  'color-primary-700': '#8D1639',
  'color-primary-800': '#710E34',
  'color-primary-900': '#5E0831',
  'color-primary-transparent-100': 'rgba(196, 45, 62, 0.08)',
  'color-primary-transparent-200': 'rgba(196, 45, 62, 0.16)',
  'color-primary-transparent-300': 'rgba(196, 45, 62, 0.24)',
  'color-primary-transparent-400': 'rgba(196, 45, 62, 0.32)',
  'color-primary-transparent-500': 'rgba(196, 45, 62, 0.4)',
  'color-primary-transparent-600': 'rgba(196, 45, 62, 0.48)',
  'color-success-100': '#DFF9D5',
  'color-success-200': '#B9F4AD',
  'color-success-300': '#85DE7E',
  'color-success-400': '#57BE58',
  'color-success-500': '#299334',
  'color-success-600': '#1D7E30',
  'color-success-700': '#14692D',
  'color-success-800': '#0D5528',
  'color-success-900': '#074625',
  'color-success-transparent-100': 'rgba(41, 147, 52, 0.08)',
  'color-success-transparent-200': 'rgba(41, 147, 52, 0.16)',
  'color-success-transparent-300': 'rgba(41, 147, 52, 0.24)',
  'color-success-transparent-400': 'rgba(41, 147, 52, 0.32)',
  'color-success-transparent-500': 'rgba(41, 147, 52, 0.4)',
  'color-success-transparent-600': 'rgba(41, 147, 52, 0.48)',
  'color-info-100': '#C7F7F9',
  'color-info-200': '#92E9F3',
  'color-info-300': '#58C6DD',
  'color-info-400': '#2E9ABB',
  'color-info-500': '#00638E',
  'color-info-600': '#004C7A',
  'color-info-700': '#003966',
  'color-info-800': '#002852',
  'color-info-900': '#001D44',
  'color-info-transparent-100': 'rgba(0, 99, 142, 0.08)',
  'color-info-transparent-200': 'rgba(0, 99, 142, 0.16)',
  'color-info-transparent-300': 'rgba(0, 99, 142, 0.24)',
  'color-info-transparent-400': 'rgba(0, 99, 142, 0.32)',
  'color-info-transparent-500': 'rgba(0, 99, 142, 0.4)',
  'color-info-transparent-600': 'rgba(0, 99, 142, 0.48)',
  'color-warning-100': '#FEF5CB',
  'color-warning-200': '#FEE798',
  'color-warning-300': '#FCD665',
  'color-warning-400': '#FAC53E',
  'color-warning-500': '#F7A900',
  'color-warning-600': '#D48A00',
  'color-warning-700': '#B16E00',
  'color-warning-800': '#8F5400',
  'color-warning-900': '#764100',
  'color-warning-transparent-100': 'rgba(247, 169, 0, 0.08)',
  'color-warning-transparent-200': 'rgba(247, 169, 0, 0.16)',
  'color-warning-transparent-300': 'rgba(247, 169, 0, 0.24)',
  'color-warning-transparent-400': 'rgba(247, 169, 0, 0.32)',
  'color-warning-transparent-500': 'rgba(247, 169, 0, 0.4)',
  'color-warning-transparent-600': 'rgba(247, 169, 0, 0.48)',
  'color-danger-100': '#FCDBC9',
  'color-danger-200': '#F9AF95',
  'color-danger-300': '#EC775E',
  'color-danger-400': '#DB4436',
  'color-danger-500': '#c30000',
  'color-danger-600': '#A7000E',
  'color-danger-700': '#8C0018',
  'color-danger-800': '#71001D',
  'color-danger-900': '#5D0020',
  'color-danger-transparent-100': 'rgba(195, 0, 0, 0.08)',
  'color-danger-transparent-200': 'rgba(195, 0, 0, 0.16)',
  'color-danger-transparent-300': 'rgba(195, 0, 0, 0.24)',
  'color-danger-transparent-400': 'rgba(195, 0, 0, 0.32)',
  'color-danger-transparent-500': 'rgba(195, 0, 0, 0.4)',
  'color-danger-transparent-600': 'rgba(195, 0, 0, 0.48)',

  /**
   *  Backgrounds and borders are controlled with Basic color.
   */
  'color-basic-100': '#FFFFFF',
  'color-basic-200': '#F5F5F5',
  'color-basic-300': '#F5F5F5',
  'color-basic-400': '#D4D4D4',
  'color-basic-500': '#B3B3B3',
  'color-basic-600': '#808080',
  'color-basic-700': '#4A4A4A',
  'color-basic-800': '#383838',
  'color-basic-900': '#292929',
  'color-basic-1000': '#1F1F1F',
  'color-basic-1100': '#141414',

  /**
   * There are 6 shades of transparency in Eva. Pick color-basic-600 value and
   * transform it to rgba format with adding an alpha channel. In Eva, we start
   * with 8% transparency and move up with increasing it on the same value.
   */
  'color-basic-transparent-100': 'rgba(128, 128, 128, 0.08)',
  'color-basic-transparent-200': 'rgba(128, 128, 128, 0.16)',
  'color-basic-transparent-300': 'rgba(128, 128, 128, 0.24)',
  'color-basic-transparent-400': 'rgba(128, 128, 128, 0.32)',
  'color-basic-transparent-500': 'rgba(128, 128, 128, 0.4)',
  'color-basic-transparent-600': 'rgba(128, 128, 128, 0.48)',
}

export default myTheme
