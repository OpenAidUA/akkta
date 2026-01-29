import { Button } from '@/components/ui/button';

import { FilePlus, Plus } from 'react-feather';

import EmptyPagePlaceholder from '@/shared/components/EmptyPage';

export default function Acts() {
  const acts: string[] = [];

  return (
    <>
      {acts.length === 0 ? (
        <EmptyPagePlaceholder
          icon={<FilePlus size={24} color="black" />}
          title="Актів ще не створено"
          descr="Тут з'являтимуться ваші акти виконаних робіт. Створіть свій перший документ, щоб розпочати — це займе близько хвилини."
        >
          <Button
            className="bg-linear-to-r from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] text-white shadow-md transition-color duration-700 active:scale-95"
            aria-label="Submit"
          >
            <Plus />
            Створити акт
          </Button>
        </EmptyPagePlaceholder>
      ) : (
        // ...рендер списка клиентов
        <ul>
          {acts.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
    </>
  );
}
