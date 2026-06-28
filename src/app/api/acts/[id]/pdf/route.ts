import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import createSupabaseAdminClient from '@/shared/superbase/admin';
import {
  getActById,
  getActPdf,
  generateAndSaveActPdf,
} from '@/modules/acts/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const PDF_BUCKET = process.env.SUPABASE_PDFS_BUCKET || 'acts-pdfs';

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

    const existing = await getActPdf(act.id);

    let pdfBuffer: Buffer;

    if (existing?.fileUrl) {
      const supabaseAdmin = createSupabaseAdminClient();

      const { data, error } = await supabaseAdmin.storage
        .from(PDF_BUCKET)
        .download(existing.fileUrl);

      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);
      } else {
        console.warn('Stored PDF missing, regenerating...');
        const result = await generateAndSaveActPdf(act.id, user.id);
        pdfBuffer = result.pdfBuffer;
      }
    } else {
      console.log('No existing PDF found, generating new one...');
      const result = await generateAndSaveActPdf(act.id, user.id);
      pdfBuffer = result.pdfBuffer;
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="act.pdf"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error('PDF download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
