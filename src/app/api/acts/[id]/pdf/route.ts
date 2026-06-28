import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import {
  getActById,
  getActPdf,
  generateAndSaveActPdf,
} from '@/modules/acts/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const act = await getActById(id, user.id);

    if (!act) {
      return NextResponse.json({ error: 'Act not found' }, { status: 404 });
    }

    const filename = `act-${act.data.meta.number || act.id}.pdf`;
    const encodedFilename = encodeURIComponent(filename);

    // Try to find an existing stored PDF (most efficient)
    const existing = await getActPdf(act.id);

    if (existing?.fileUrl) {
      try {
        const fileRes = await fetch(existing.fileUrl);

        if (fileRes.ok) {
          const arrayBuffer = await fileRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          return new NextResponse(new Uint8Array(buffer), {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="act.pdf"; filename*=UTF-8''${encodedFilename}`,
              'Content-Length': String(buffer.length),
            },
          });
        } else {
          console.warn(
            'Failed to fetch saved PDF, will regenerate. Status:',
            fileRes.status,
          );
        }
      } catch (fetchErr) {
        console.warn('Error fetching saved PDF, will regenerate:', fetchErr);
      }
      return;
    }

    // No saved PDF available or fetching failed — generate, upload and save, then return
    const { pdfBuffer } = await generateAndSaveActPdf(act.id, user.id);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="act.pdf"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error: unknown) {
    console.error('PDF download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
