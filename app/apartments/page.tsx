"use client";

import { UIProvider } from "@/hooks/useLeadModal";
import { Header } from "@/components/Header";
import { ApartmentPicker } from "@/components/ApartmentPicker";
import { Footer } from "@/components/Footer";
import { LeadModal } from "@/components/LeadModal";

export default function ApartmentsPage() {
  return (
    <UIProvider>
      <Header />
      <main>
        <ApartmentPicker />
        <Footer />
      </main>
      <LeadModal />
    </UIProvider>
  );
}
