import { NextResponse } from 'next/server';
// import { getSessionUser } from '@/shared/auth';
import { CreateActRequestSchema } from '@/modules/acts/domain';
import { createAct } from '@/modules/acts/service';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    // const user = await getSessionUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: replace hardcoded IDs with real auth context
    const organizationId = '122';
    const userId = '122';

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
