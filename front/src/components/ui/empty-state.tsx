import type { ComponentType, ReactNode, SVGProps } from 'react';

type EmptyStateProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  text: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-8 text-center">
      <span className="flex size-[84px] items-center justify-center rounded-full bg-glass text-ink-64 shadow-bevel">
        <Icon className="size-[34px]" aria-hidden="true" />
      </span>

      <h2 className="text-headline font-bold text-white">{title}</h2>

      <p className="max-w-[280px] text-callout text-ink-46">{text}</p>

      {action}
    </div>
  );
}
