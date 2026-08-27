import { Mail } from 'lucide-react';
import Image from 'next/image';

import { ProfileAvatar } from '@/components/profile/profile-avatar';
import { ProfileIdentityRow } from '@/components/profile/profile-layout';
import { ProfileMenu } from '@/components/profile/profile-menu';
import type { User } from '@/types/user';

const COVER_IMAGE = '/football-sunset.jpg';

export function ProfileHeader({ user }: { user: User }) {
  return (
    <header>
      <div className="relative h-[196px] w-full overflow-hidden bg-raised lg:h-[206px]">
        <Image
          src={COVER_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base from-[3%] to-transparent to-[62%]" />
        <div className="absolute right-5 top-5 lg:hidden">
          <ProfileMenu />
        </div>
      </div>

      <ProfileIdentityRow>
        <ProfileAvatar name={user.nombre} photoUrl={user.fotoUrl} />

        <div className="flex flex-col items-center gap-[2.5px] lg:flex-1 lg:items-start lg:pb-2">
          <h1 className="text-center text-[26.6px] font-bold leading-[32.48px] tracking-[-0.17px] text-white lg:text-left lg:text-[36.2px] lg:font-extrabold lg:leading-[44px] lg:tracking-[-1.33px]">
            {user.nombre}
          </h1>
          <p className="flex items-center gap-1.5 text-callout font-normal leading-[21.75px] tracking-[-0.17px] text-white/46 lg:text-[16px] lg:leading-[23.2px]">
            <Mail className="size-[14px] shrink-0 lg:size-4" aria-hidden="true" />
            {user.email}
          </p>
        </div>

        <ProfileMenu variant="labelled" className="hidden lg:flex lg:shrink-0" />
      </ProfileIdentityRow>
    </header>
  );
}
