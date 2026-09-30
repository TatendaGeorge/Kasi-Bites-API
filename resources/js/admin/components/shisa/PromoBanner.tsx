import { art } from './art';
import { Button } from './Button';

export interface PromoBannerProps {
  title: string;
  body: string;
  cta?: string;
  image?: string;
  dots?: number;
  activeDot?: number;
  onClick?: () => void;
}

export function PromoBanner({ title, body, cta, image, dots, activeDot = 0, onClick }: PromoBannerProps) {
  return (
    <div>
      <section className="sh-promo">
        {image ? <img className="sh-promo-art" src={art(image)} alt="" /> : null}
        <h3>{title}</h3>
        <p>{body}</p>
        <Button variant="light" size="sm" iconEnd="arrow-up-right" onClick={onClick}>
          {cta || 'Order now'}
        </Button>
      </section>
      {dots ? (
        <div className="sh-promo-dots" aria-hidden="true">
          {Array.from({ length: dots }, (_, i) => (
            <i key={i} className={i === activeDot ? 'on' : ''} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
