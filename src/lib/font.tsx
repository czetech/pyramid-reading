import fontData from "@fontsource/roboto-condensed/files/roboto-condensed-latin-400-normal.woff2?inline";

export const fontStyle = `
  @font-face {
    font-family: 'Roboto Condensed';
    src: url(${fontData}) format('woff2');
  }
  svg {
    font-family: 'Roboto Condensed', sans-serif;
    word-spacing: 2ch;
  }
`;
