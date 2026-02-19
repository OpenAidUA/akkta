'use server';

import { createSupabaseServerClient } from '@/shared/superbase/server';
import { generateAndSaveActPdf } from '@/modules/acts/service';
import { revalidatePath } from 'next/cache';

export type GeneratePdfState = {
  message?: string;
  error?: boolean;
} | null;

export async function generatePdfAction(
  actId: string,
): Promise<GeneratePdfState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Unauthorized', error: true };
  }

  try {
    await generateAndSaveActPdf(actId, user.id);
    revalidatePath(`/acts/${actId}`);
    revalidatePath('/acts');
    return { message: 'PDF успішно згенеровано!' };
  } catch (error: unknown) {
    console.error('PDF generation failed:', error);
    return {
      message:
        error instanceof Error
          ? error.message
          : 'Не вдалося згенерувати PDF',
      error: true,
    };
  }
}
