'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Search } from 'react-feather';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

type SortField = 'name' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'archived';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'За назвою А → Я' },
  { value: 'name-desc', label: 'За назвою Я → А' },
  { value: 'createdAt-desc', label: 'Спочатку нові' },
  { value: 'createdAt-asc', label: 'Спочатку старі' },
] as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Усі статуси' },
  { value: 'active', label: 'Активні' },
  { value: 'archived', label: 'Архівні' },
] as const;

interface ProjectsToolbarProps {
  search: string;
  status: StatusFilter;
  sortBy: SortField;
  sortOrder: SortOrder;
  total: number;
}

export function ProjectsToolbar({
  search,
  status,
  sortBy,
  sortOrder,
  total,
}: ProjectsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      startTransition(() => {
        router.push(`/projects?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        updateParams({ q: value || undefined, page: undefined });
      }, 500);
    },
    [updateParams],
  );

  // Cleanup debounce timer on unmount to avoid updating state/navigating
  // after the component is gone.
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSortChange = useCallback(
    (value: string) => {
      const [field, order] = value.split('-') as [SortField, SortOrder];
      updateParams({ sort: field, order, page: undefined });
    },
    [updateParams],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      updateParams({
        status: value === 'all' ? undefined : value,
        page: undefined,
      });
    },
    [updateParams],
  );

  const currentSortValue = `${sortBy}-${sortOrder}`;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 ${isPending ? 'opacity-70' : ''}`}
    >
      <div className="relative max-w-sm w-full">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          placeholder="Пошук за назвою або адресою"
          className="pl-9"
          value={query}
          onChange={handleSearch}
        />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-slate-400 text-xs whitespace-nowrap">
          {total} проєктів
        </span>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-xs"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentSortValue} onValueChange={handleSortChange}>
          <SelectTrigger className="w-45 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-xs"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
