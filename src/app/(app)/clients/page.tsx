import { Button } from '@/components/ui/button';

import { Users, Plus } from 'react-feather';

import EmptyPagePlaceholder from '@/shared/components/EmptyPage';

export default function Clients() {
  const clients: string[] = [];

  return (
    <>
      {clients.length === 0 ? (
        <EmptyPagePlaceholder
          icon={<Users size={24} color="black" />}
          title="Клієнтів ще не додано"
          descr="Додайте своїх клієнтів сюди, щоб пришвидшити створення документів. Після додавання їхні юридичні реквізити будуть автоматично підставлятися в нові акти."
        >
          <Button
            className="bg-linear-to-r from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] text-white shadow-md transition-color duration-700 active:scale-95"
            aria-label="Submit"
          >
            <Plus />
            Додати клієнта
          </Button>
        </EmptyPagePlaceholder>
      ) : (
        // ...рендер списка клиентов
        <ul>
          {clients.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
    </>
  );
}
