"use client";
import { LanguageProvider } from "@/contexts/language/LanguageContext";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { TourProvider } from "@reactour/tour";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TourProvider
      steps={[
        {
          selector: "#nextjsimage",
          content: "Nextjs image",
        },

        {
          selector: "#lang-shower",
          content: "Shows current language",
        },
      ]}
      defaultOpen
    >
      <LanguageProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>{children}</SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </LanguageProvider>
    </TourProvider>
  );
}
