import './globals.css';

export const metadata = {
  title: 'Bill Manager - Monthly Bills Tracker',
  description: 'Easy to use app to manage and track your monthly bills and payments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}