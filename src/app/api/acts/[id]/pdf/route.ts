import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { getActById } from '@/modules/acts/service';
import { generateActPdf } from '@/modules/acts/pdf';

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

    // Generate PDF on-the-fly
    const pdfBuffer = await generateActPdf({
      act: act.data,
      clientSnapshot: act.clientSnapshot,
    });

    const filename = `act-${act.data.meta.number || act.id}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
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
