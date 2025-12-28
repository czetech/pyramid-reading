import fontDataLatin from "@fontsource/roboto-condensed/files/roboto-condensed-latin-500-normal.woff2?inline";
import fontDataLatinExt from "@fontsource/roboto-condensed/files/roboto-condensed-latin-ext-500-normal.woff2?inline";

export const fontStyle = `
  @font-face {
    font-family: 'Roboto Condensed';
    src: url(${fontDataLatin}) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  @font-face {
    font-family: 'Roboto Condensed';
    src: url(${fontDataLatinExt}) format('woff2');
    unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
  }
  svg {
    font-family: 'Roboto Condensed', sans-serif;
    word-spacing: 2ch;
  }
`;
