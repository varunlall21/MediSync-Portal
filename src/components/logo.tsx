
import { BriefcaseMedical } from 'lucide-react';
import Link from 'next/link';

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-xl font-bold text-primary ${className}`}>
      <BriefcaseMedical className="h-7 w-7" />
      <span>MediSync</span>
    </Link>
  );
}
