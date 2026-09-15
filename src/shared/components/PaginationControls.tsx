import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/pagination';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  pathname: string;
  searchParams?: Record<string, string | undefined>;
  className?: string;
}

function getPageNumbers(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export function PaginationControls({
  page,
  totalPages,
  pathname,
  searchParams = {},
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const hrefForPage = (targetPage: number) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    if (targetPage > 1) params.set('page', String(targetPage));
    const query = params.toString();

    return query ? `${pathname}?${query}` : pathname;
  };

  const pages = getPageNumbers(page, totalPages);

  return (
    <Pagination className={cn('mt-6', className)}>
      <PaginationContent>
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious href={hrefForPage(page - 1)} className="mr-3" />
          ) : (
            <span className="inline-flex h-9 items-center gap-1 px-2.5 text-sm text-slate-400">
              Назад
            </span>
          )}
        </PaginationItem>

        {pages.map((item, index) => (
          <PaginationItem key={item}>
            {index > 0 && item - pages[index - 1] > 1 && <PaginationEllipsis />}
            <PaginationLink href={hrefForPage(item)} isActive={item === page}>
              {item}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          {page < totalPages ? (
            <PaginationNext href={hrefForPage(page + 1)} className="ml-3" />
          ) : (
            <span className="ml-3 inline-flex h-9 items-center gap-1 px-2.5 text-sm text-slate-400">
              Далі
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
