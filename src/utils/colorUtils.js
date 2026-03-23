export const colorToHex = (colorName) => {
  const colorMap = {
    red: '#E63946',
    navy: '#1B2A4A',
    blue: '#4682B4',
    white: '#F8F8F8',
    black: '#1A1A1A',
    grey: '#9E9E9E',
    gray: '#9E9E9E',
    brown: '#8B5E3C',
    cream: '#F5F0E8',
    beige: '#E8DCC8',
    green: '#4A7C59',
    pink: '#E8A0B4',
    yellow: '#F4D35E',
    orange: '#F4845F',
    purple: '#7B5EA7',
    burgundy: '#6D1E2A',
    tan: '#C9A96E',
    camel: '#C19A6B',
    ivory: '#FFFFF0',
    khaki: '#BDB76B',
    denim: '#5B7FA6',
  }
  const key = colorName?.toLowerCase().split('/')[0].split(' ').pop()
  return colorMap[key] || '#888888'
}