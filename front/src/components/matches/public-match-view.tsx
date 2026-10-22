'use client';

import { ArrowRight, CalendarCheck, CalendarX, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { LoadingScreen } from '@/components/loading-screen';
import { MatchDetailLayout, MatchNotFound } from '@/components/matches/match-detail-layout';
import { pillButtonClassName } from '@/components/ui/pill-button';
import { usePublicMatch } from '@/hooks/use-public-match';
import { LOGIN_HREF, withNext } from '@/lib/auth-redirect';
import { matchPath } from '@/lib/public-matches';
import { cn } from '@/lib/utils';
import type { PublicMatch } from '@/types/match';

const HEADER = 'flex items-center justify-between gap-4 px-5 py-4 lg:px-8';

const LOGIN_LINK = 'text-callout font-semibold text-brand transition hover:text-brand-bright';

const NOTICE = 'flex items-center gap-3 rounded-md p-4 text-callout font-semibold';

const NOTICE_TONE = {
  neutral: 'bg-glass text-white shadow-bevel-lit',
  danger: 'bg-danger-tint text-danger',
} as const;

function PublicHeader({ loginHref }: { loginHref: string }) {
  return (
    <header className={HEADER}>
      <Link href="/" aria-label="SportMatch">
        <BrandLogo className="text-2xl" />
      </Link>
      <Link href={loginHref} className={LOGIN_LINK}>
        Iniciar sesión
      </Link>
    </header>
  );
}

type NoticeProps = {
  icon: LucideIcon;
  title: string;
  tone: keyof typeof NOTICE_TONE;
};

function Notice({ icon: Icon, title, tone }: NoticeProps) {
  return (
    <p className={cn(NOTICE, NOTICE_TONE[tone])}>
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {title}
    </p>
  );
}

type JoinPanelProps = {
  match: PublicMatch;
  played: boolean;
  joinHref: string;
};

function JoinPanel({ match, played, joinHref }: JoinPanelProps) {
  if (match.status === 'CANCELED') {
    return <Notice icon={CalendarX} tone="danger" title="Este partido se canceló" />;
  }

  if (played) {
    return <Notice icon={CalendarCheck} tone="neutral" title="Este partido ya se jugó" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <Link href={joinHref} className={pillButtonClassName({ size: 'lg', className: 'w-full' })}>
        Sumate
        <ArrowRight className="size-[18px]" aria-hidden="true" />
      </Link>
      <p className="text-center text-caption text-ink-46">
        Entrá o creá tu cuenta para pedir tu lugar.
      </p>
    </div>
  );
}

export function PublicMatchView({ id }: { id: string }) {
  const { match, loading, notFound, error } = usePublicMatch(id);
  const [now] = useState(() => Date.now());
  const joinHref = withNext(LOGIN_HREF, matchPath(id));

  if (loading) {
    return <LoadingScreen />;
  }

  if (!match) {
    return (
      <>
        <PublicHeader loginHref={joinHref} />
        <MatchNotFound
          notFound={notFound}
          error={error}
          className="min-h-[70dvh]"
          action={
            <Link href="/" className={pillButtonClassName({ size: 'md' })}>
              Conocé SportMatch
            </Link>
          }
        />
      </>
    );
  }

  const played = new Date(match.date).getTime() <= now;
  const joinPanel = <JoinPanel match={match} played={played} joinHref={joinHref} />;

  return (
    <>
      <PublicHeader loginHref={joinHref} />
      <MatchDetailLayout
        match={match}
        played={played}
        aside={<div className="hidden lg:block">{joinPanel}</div>}
        bottomBar={joinPanel}
      />
    </>
  );
}
