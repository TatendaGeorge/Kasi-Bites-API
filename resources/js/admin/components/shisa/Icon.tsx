import type { CSSProperties } from 'react';
import {
  House,
  ShoppingBag,
  Search,
  ReceiptText,
  CircleUser,
  ShoppingCart,
  MapPin,
  Star,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Bell,
  LocateFixed,
  Bike,
  Footprints,
  Plus,
  Minus,
  Heart,
  SlidersHorizontal,
  X,
  Menu,
  Check,
  Tag,
  Flame,
  Store,
  Utensils,
  CreditCard,
  Gift,
  Eye,
  Phone,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  house: House,
  'shopping-bag': ShoppingBag,
  search: Search,
  'receipt-text': ReceiptText,
  'circle-user': CircleUser,
  'shopping-cart': ShoppingCart,
  'map-pin': MapPin,
  star: Star,
  clock: Clock,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  'arrow-up-right': ArrowUpRight,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  bell: Bell,
  'locate-fixed': LocateFixed,
  bike: Bike,
  footprints: Footprints,
  plus: Plus,
  minus: Minus,
  heart: Heart,
  'sliders-horizontal': SlidersHorizontal,
  x: X,
  menu: Menu,
  check: Check,
  tag: Tag,
  flame: Flame,
  store: Store,
  utensils: Utensils,
  'credit-card': CreditCard,
  gift: Gift,
  eye: Eye,
  phone: Phone,
  'message-circle': MessageCircle,
};

export interface IconProps {
  name: string;
  size?: number;
  filled?: boolean;
  strokeWidth?: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 22, filled, strokeWidth = 1.75, label, className, style }: IconProps) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return (
    <Cmp
      className={cn('sh-icon', className)}
      style={style}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    />
  );
}
