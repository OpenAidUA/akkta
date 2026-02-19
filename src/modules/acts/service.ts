import { prisma } from '@/lib/db';
import { calculateTotals } from './helpers';
import { CreateActRequest } from './domain';
import type { ActWithClient } from './types';
import { generateActPdf } from './pdf';
import crypto from 'crypto';

export async function createAct(
  organizationId: string,
  userId: string,
  payload: CreateActRequest,
) {
  return await prisma.$transaction(async (tx) => {
    const validatedAct = calculateTotals(payload.act);

    let clientId: string | null = payload.client.id ?? null;
    const clientSnapshot = payload.client.snapshot;

    if (clientId) {
      const exists = await tx.client.findFirst({
        where: { id: clientId, organizationId },
      });

      if (!exists) {
        throw new Error('Client not found');
      }
    }

    if (payload.client.save === true && !clientId) {
      const client = await tx.client.create({
        data: {
          ...clientSnapshot,
          organizationId,
        },
      });
      clientId = client.id;
    }

    const act = await tx.act.create({
      data: {
        userId,
        organizationId,
        clientId,
        clientSnapshot,
        data: validatedAct,
        templateVersion: 'v1',
        status: 'draft',
      },
    });

    return act;
  });
}

export async function getUserActs(userId: string): Promise<ActWithClient[]> {
  const acts = await prisma.act.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      client: true,
    },
  });

  return acts as unknown as ActWithClient[];
}

export async function getActById(
  actId: string,
  userId: string,
): Promise<ActWithClient | null> {
  const act = await prisma.act.findFirst({
    where: { id: actId, userId },
    include: { client: true },
  });

  return (act as unknown as ActWithClient) ?? null;
}

export async function getActPdf(actId: string) {
  return prisma.actPdf.findFirst({
    where: { actId },
    orderBy: { generatedAt: 'desc' },
  });
}

/**
 * Generates a PDF for the act, stores it as a base64 data URL in ActPdf,
 * and transitions the act status to 'ready'.
 * For production, replace fileUrl with Supabase Storage upload.
 */
export async function generateAndSaveActPdf(
  actId: string,
  userId: string,
): Promise<{ pdfBuffer: Buffer; actPdfId: string }> {
  const act = await getActById(actId, userId);
  if (!act) throw new Error('Act not found');

  // Mark as generating
  await prisma.act.update({
    where: { id: actId },
    data: { status: 'generating' },
  });

  try {
    const pdfBuffer = await generateActPdf({
      act: act.data,
      clientSnapshot: act.clientSnapshot,
    });

    const checksum = crypto
      .createHash('sha256')
      .update(pdfBuffer)
      .digest('hex');

    // Check if identical PDF already exists
    const existing = await prisma.actPdf.findFirst({
      where: { actId, checksum },
    });

    if (existing) {
      await prisma.act.update({
        where: { id: actId },
        data: { status: 'ready' },
      });
      return { pdfBuffer, actPdfId: existing.id };
    }

    // Store as file URL placeholder — in production, upload to Supabase Storage
    // and store the real URL. For now we store a marker.
    const actPdf = await prisma.actPdf.create({
      data: {
        actId,
        templateVersion: act.templateVersion,
        checksum,
        fileUrl: `/api/acts/${actId}/pdf`,
        size: pdfBuffer.length,
      },
    });

    await prisma.act.update({
      where: { id: actId },
      data: { status: 'ready' },
    });

    return { pdfBuffer, actPdfId: actPdf.id };
  } catch (error) {
    await prisma.act.update({
      where: { id: actId },
      data: { status: 'failed' },
    });
    throw error;
  }
}
