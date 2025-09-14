import './globals.css';

export const metadata = {
  title: 'YardNotes',
  description: 'Notes app — login, notes, upgrade tenant'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div>{children}</div>
      </body>
    </html>
  );
}
