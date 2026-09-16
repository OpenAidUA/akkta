'use server';

import { FeedbackSchema } from '@/modules/feedback/domain';
import { sendFeedbackEmail } from '@/modules/feedback/service';
import { createSupabaseServerClient } from '@/shared/supabase/server';

const MAX_SCREENSHOTS = 3;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const imageSignatures: Record<string, number[]> = {
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

export type FeedbackState = {
  success?: boolean;
  message?: string;
  errors?: {
    category?: string;
    message?: string;
    screenshots?: string;
  };
} | null;

function hasValidImageSignature(file: File, bytes: Uint8Array) {
  const signature = imageSignatures[file.type];
  if (!signature || !signature.every((byte, index) => bytes[index] === byte)) {
    return false;
  }

  return (
    file.type !== 'image/webp' ||
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
  );
}

export async function submitFeedbackAction(
  _previousState: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { message: 'Щоб надіслати відгук, потрібно увійти до акаунта.' };
  }

  const result = FeedbackSchema.safeParse({
    category: formData.get('category'),
    message: formData.get('message'),
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return {
      message: 'Перевірте дані форми.',
      errors: {
        category: errors.category?.[0],
        message: errors.message?.[0],
      },
    };
  }

  const files = formData
    .getAll('screenshots')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length > MAX_SCREENSHOTS) {
    return { errors: { screenshots: 'Можна додати до 3 скриншотів.' } };
  }

  if (files.some((file) => file.size > MAX_FILE_SIZE)) {
    return {
      errors: {
        screenshots: 'Розмір кожного файлу не повинен перевищувати 2 МБ.',
      },
    };
  }

  try {
    const attachments = await Promise.all(
      files.map(async (file, index) => {
        const bytes = new Uint8Array(await file.arrayBuffer());

        if (!hasValidImageSignature(file, bytes)) {
          throw new Error('Invalid image file');
        }

        const extension =
          file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
        return {
          filename: `screenshot-${index + 1}.${extension}`,
          content: Buffer.from(bytes).toString('base64'),
          contentType: file.type,
        };
      }),
    );

    await sendFeedbackEmail({
      ...result.data,
      userEmail: user.email,
      userId: user.id,
      attachments,
    });

    return { success: true, message: 'Дякуємо! Ваш відгук надіслано.' };
  } catch (error) {
    console.error('Feedback submission failed', error);
    return {
      message: 'Не вдалося надіслати відгук. Спробуйте ще раз трохи пізніше.',
    };
  }
}
