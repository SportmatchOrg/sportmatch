import type { ReactNode } from 'react';

import { ScreenHeader } from '@/components/ui/screen-header';

const PAGE = 'flex w-full flex-col gap-6 px-5 py-6 lg:gap-8 lg:px-6 lg:py-10 xl:px-8';

type EditProfileLayoutProps = {
  action?: ReactNode;
  children: ReactNode;
};

export function EditProfileLayout({ action, children }: EditProfileLayoutProps) {
  return (
    <main className={PAGE}>
      <ScreenHeader overline="Ajustes" title="Editar perfil" action={action} />
      {children}
    </main>
  );
}
