import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#79502A]" />
      </div>
    </div>
  );
}
