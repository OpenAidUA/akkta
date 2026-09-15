import { MessageSquare } from 'react-feather';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/shared/supabase/server';
import FeedbackForm from './FeedbackForm';

export const metadata = {
  title: 'Зворотний зв’язок',
};

export default async function FeedbackPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="mx-auto max-w-2xl pb-20">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <MessageSquare size={20} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Зворотний зв’язок
          </h1>
        </div>
        <p className="ml-12 text-sm text-slate-500">
          Розкажіть про свій досвід або надішліть повідомлення про проблему.
        </p>
      </div>
      <FeedbackForm />
    </div>
  );
}
