import { IconButton } from './IconButton';

export interface SectionHeaderProps {
  title: string;
  action?: string | false;
  href?: string;
  arrows?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

export function SectionHeader({ title, action, href, arrows, onPrev, onNext }: SectionHeaderProps) {
  return (
    <div className="sh-sechead">
      <h2>{title}</h2>
      <div className="sh-row">
        {action !== false ? (
          <a className="sh-link" href={href || '#'}>
            {action || 'See all'}
          </a>
        ) : null}
        {arrows ? (
          <>
            <IconButton icon="arrow-left" label="Previous" size="sm" flat onClick={onPrev} />
            <IconButton icon="arrow-right" label="Next" size="sm" flat onClick={onNext} />
          </>
        ) : null}
      </div>
    </div>
  );
}
