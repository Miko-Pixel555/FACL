import "./globals.css";

export const metadata = {
  title: "Course Tracker",
  description: "Track student course completions, certificates and rankings.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
