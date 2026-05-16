'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#F2E8CF',
          color: '#1F1812',
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 600,
            margin: '0 0 12px 0',
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Something went wrong.
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: '#6B5D45',
            margin: '0 0 32px 0',
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          We hit an unexpected problem.
        </p>

        <button
          onClick={reset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: '#2D5235',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 500,
            fontFamily: "Georgia, 'Times New Roman', serif",
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>

        <a
          href="/now"
          style={{
            marginTop: '16px',
            fontSize: '14px',
            color: '#6B5D45',
            textDecoration: 'underline',
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Go home
        </a>
      </body>
    </html>
  );
}
