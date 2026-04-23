import { NextResponse } from 'next/server';
import { CreateActRequestSchema } from '@/modules/acts/domain';
import { createAct } from '@/modules/acts/service';
import { ZodError } from 'zod';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { getOrganizationByUserId } from '@/modules/organizations/service';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const org = await getOrganizationByUserId(user.id);
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 403 });
    }

    const organizationId = org.id;
    const userId = user.id;

    const body = await req.json();
    const parsed = CreateActRequestSchema.parse(body);

    const act = await createAct(organizationId, userId, parsed);

    return NextResponse.json({
      id: act.id,
      status: act.status,
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: err.message },
        { status: 400 },
      );
    }

    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
