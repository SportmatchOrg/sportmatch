"use client";

import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

import { InvitePlayersDialog } from "@/components/matches/invite-players-dialog";
import { MatchActions } from "@/components/matches/match-actions";
import { MatchDetailLayout, MatchNotFound } from "@/components/matches/match-detail-layout";
import { MatchPlayers } from "@/components/matches/match-players";
import { PublicMatchView } from "@/components/matches/public-match-view";
import { ShareMatchButton } from "@/components/matches/share-match-button";
import { RatingSection } from "@/components/ratings/rating-section";
import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/context/auth-context";
import { useMatch } from "@/hooks/use-match";
import { useCurrentUser } from "@/hooks/use-current-user";
import { matchShareTitle } from "@/lib/public-matches";

const OTHER_MATCHES_LINK =
  "rounded-full bg-brand px-6 py-3 text-callout font-semibold text-brand-ink";

export default function MatchDetailPage({
  params,
}: PageProps<"/partidos/[id]">) {
  const { id } = use(params);
  const { user: session, loading: sessionLoading } = useAuth();

  if (sessionLoading) {
    return <LoadingScreen />;
  }

  return session ? <MatchDetail id={id} /> : <PublicMatchView id={id} />;
}

function MatchDetail({ id }: { id: string }) {
  const router = useRouter();
  const { match, loading, notFound, error } = useMatch(id);
  const { user, loading: userLoading } = useCurrentUser();
  const [now] = useState(() => Date.now());

  if (loading || userLoading) {
    return <LoadingScreen />;
  }

  if (notFound || !match) {
    return (
      <MatchNotFound
        notFound={notFound}
        error={error}
        className="min-h-dvh"
        action={
          <Link href="/buscar" className={OTHER_MATCHES_LINK}>
            Ver otros partidos
          </Link>
        }
      />
    );
  }

  const isOrganizer = user?.id === match.organizer.id;
  const played = new Date(match.date).getTime() <= now;
  const canInvite = isOrganizer && !played && match.status === "ACTIVE"
    && match.joinedCount < match.capacity;

  const actions = (
    <MatchActions
      key={match.id}
      match={match}
      isOrganizer={isOrganizer}
      suspendedUntil={user?.stats.suspendedUntil ?? null}
      requestReady={!!user}
    />
  );

  return (
    <MatchDetailLayout
      match={match}
      played={played}
      onBack={() => router.back()}
      heroAction={
        <ShareMatchButton matchId={match.id} title={matchShareTitle(match)} />
      }
      withTabBar
      bottomBar={played ? undefined : actions}
      aside={
        <>
          <MatchPlayers
            participants={match.participants}
            organizer={match.organizer}
            joinedCount={match.joinedCount}
            capacity={match.capacity}
            played={played}
          />

          {canInvite && <InvitePlayersDialog match={match} />}

          {played ? (
            <div className="flex flex-col gap-4 rounded-md bg-glass p-4 shadow-bevel-lit">
              <span className="flex items-center gap-3">
                <CalendarCheck
                  className="size-5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <span className="text-callout font-semibold text-white">
                  Este partido ya se jugó
                </span>
              </span>

              <RatingSection matchId={match.id} played={played} />
            </div>
          ) : (
            <div className="hidden lg:block">{actions}</div>
          )}
        </>
      }
    />
  );
}
