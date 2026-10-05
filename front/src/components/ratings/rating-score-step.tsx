import { TextareaField } from '@/components/matches/textarea-field';
import PeekRating from '@/components/ui/peek-rating';
import { UserAvatar } from '@/components/user-avatar';
import type { PublicUser } from '@/types/match';
import type { RatingAnswer } from '@/types/ratings';

const SCORE_LABELS = ['Flojo', 'Regular', 'Bien', 'Muy bien', 'Crack'];
const COMMENT_MAX = 280;

export function RatingScoreStep({
  target,
  answer,
  disabled,
  onChange,
}: {
  target: PublicUser;
  answer: RatingAnswer;
  disabled: boolean;
  onChange: (patch: Partial<RatingAnswer>) => void;
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <UserAvatar
          name={target.name}
          photoUrl={target.photoUrl}
          sizes="88px"
          className="size-22"
          initialsClassName="text-title"
        />
        <p className="text-subhead text-white">{target.name}</p>
        <PeekRating
          value={answer.score}
          disabled={disabled}
          onChange={(score) => onChange({ score })}
          labels={SCORE_LABELS}
          ariaLabel={`Puntaje para ${target.name}`}
          allowClear={false}
        />
      </div>
      <TextareaField
        id={`rating-comment-${target.id}`}
        label="Comentario"
        hint="opcional"
        rows={3}
        maxLength={COMMENT_MAX}
        value={answer.comment}
        disabled={disabled}
        onChange={(event) => onChange({ comment: event.target.value })}
      />
    </>
  );
}
