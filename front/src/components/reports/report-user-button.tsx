'use client';

import { Flag } from 'lucide-react';

import { profileActionClassName, type ProfileActionVariant } from '@/components/profile/settings-link';
import { ReportDialog } from '@/components/reports/report-dialog';

type ReportUserButtonProps = {
  user: { id: string; name: string };
  variant?: ProfileActionVariant;
  className?: string;
};

export function ReportUserButton({ user, variant = 'icon', className }: ReportUserButtonProps) {
  return (
    <ReportDialog
      reportedUser={user}
      trigger={
        <button
          type="button"
          aria-label={variant === 'icon' ? `Reportar a ${user.name}` : undefined}
          className={profileActionClassName(variant, className)}
        >
          <Flag className="size-5 shrink-0" aria-hidden="true" />
          {variant === 'labelled' && 'Reportar'}
        </button>
      }
    />
  );
}
