import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PageTransition from '@/components/dashboard/PageTransition';
import AnimatedSection from '@/components/dashboard/AnimatedSection';

export default function ConfiguracionPage() {
  return (
    <PageTransition>
      <DashboardHeader
        title="Configuración"
        subtitle="Configuracion de tu cuenta y preferencias"
      />

      <AnimatedSection>
        <div className="bg-white rounded-2xl p-8 border border-[#C6A97D]/20">
          <p className="font-fira text-[#79502A]">
            Opciones básicas de cuenta o ajustes.
          </p>
        </div>
      </AnimatedSection>
    </PageTransition>
  );
}