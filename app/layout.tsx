import './globals.css';

export const metadata = {
  title: 'Multi‑Tenant Notes',
  description: 'Notes app — login, notes, upgrade tenant'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
        <div style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>{children}</div>
      </body>
    </html>
  );
}
