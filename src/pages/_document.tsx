// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon Links */}
        {/* Recommended: ICO for broad compatibility */}
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* Recommended: SVG for modern browsers (scalable, respects dark mode potentially) */}
        <link rel="icon" href="/icon0.svg" type="image/svg+xml" />

        {/* Recommended: Apple touch icon for iOS home screens */}
        <link rel="apple-touch-icon" href="/apple-icon.png" />

        <link rel="icon" type="image/png" sizes="96x96" href="/icon1.png" />

        {/* Optional: Theme color for browser UI theming */}
        {/* <meta name="theme-color" content="#8B5CF6" /> */} {/* Example purple */}

      </Head>
      {/* Apply inline style for initial dark background */}
      <body style={{ backgroundColor: '#0a0a0a' }}> {/* Dark background */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}