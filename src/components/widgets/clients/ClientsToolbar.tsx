'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Search } from 'react-feather';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortField = 'name' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'За назвою А → Я' },
  { value: 'name-desc', label: 'За назвою Я → А' },
  { value: 'createdAt-desc', label: 'Спочатку нові' },
  { value: 'createdAt-asc', label: 'Спочатку старі' },
] as const;

interface ClientsToolbarProps {
  search: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  total: number;
}

export function ClientsToolbar({
  search,
  sortBy,
  sortOrder,
  total,
}: ClientsToolbarProps) {
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
        router.push(`/clients?${params.toString()}`);
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
        updateParams({ q: value || undefined });
      }, 500);
    },
    [updateParams],
  );

  // Cleanup debounce on unmount
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
      updateParams({ sort: field, order });
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
          placeholder="Пошук за назвою або email"
          className="pl-9"
          value={query}
          onChange={handleSearch}
        />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-slate-400 text-xs whitespace-nowrap">
          {total} клієнтів
        </span>

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
