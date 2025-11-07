import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PageTransition from '@/components/dashboard/PageTransition';
import AnimatedSection from '@/components/dashboard/AnimatedSection';

export default function ConfiguracionPage() {
  return (
    <PageTransition>
      <DashboardHeader
        title="Testimonios"
        subtitle="Testimonios de los clientes"
      />

      <AnimatedSection>
        <div className="bg-white rounded-2xl p-8 border border-[#C6A97D]/20">
          <p className="font-fira text-[#79502A]">
            Mensajes de los clientes.
          </p>
        </div>
      </AnimatedSection>
    </PageTransition>
  );
}