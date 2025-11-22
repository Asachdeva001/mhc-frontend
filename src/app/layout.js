import { Nunito, Quicksand, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/authContext";

// Digital Sanctuary fonts - rounded and friendly
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// High-end serif font for journal entries
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Mental Buddy - Your AI Wellness Companion",
  description: "Take care of your mental health with personalized support, mood tracking, and wellness activities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${quicksand.variable} ${playfair.variable} antialiased bg-sanctuary-sand`}
        style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
