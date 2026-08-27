import { UserAvatar } from '@/components/user-avatar';

const AVATAR_RING = 'shadow-[0_0_0_3px_var(--color-base),0_0_0_6px_var(--color-brand)]';

type ProfileAvatarProps = {
  name: string;
  photoUrl: string | null;
};

export function ProfileAvatar({ name, photoUrl }: ProfileAvatarProps) {
  return (
    <UserAvatar
      name={name}
      photoUrl={photoUrl}
      sizes="(min-width: 1024px) 140px, 104px"
      className={`size-[104px] lg:size-[140px] ${AVATAR_RING}`}
      initialsClassName="text-[32px] lg:text-[44px]"
    />
  );
}
