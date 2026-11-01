import "server-only";
import { getEventId } from "@/lib/config";
import { displayFlatNumber, normalizeFlatNumber } from "@/lib/flat-number";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateEditToken, hashEditToken, verifyEditToken } from "@/lib/tokens";
import type { CommunityStats, PublicRegistrationView } from "@/types";

export async function getCommunityStats(): Promise<CommunityStats> {
  const admin = getSupabaseAdmin();
  const eventId = getEventId();

  const { data, error } = await admin.rpc("get_registration_stats", {
    p_event_id: eventId,
  });

  if (error) {
    throw new Error(`Failed to load stats: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  return {
    totalFlats: Number(row?.total_flats ?? 0),
    totalParticipants: Number(row?.total_participants ?? 0),
    updatedAt: new Date().toISOString(),
  };
}

export async function createRegistration(input: {
  flatNumber: string;
  headCount: number;
  residentName: string | null;
}): Promise<{ registration: PublicRegistrationView; editToken: string }> {
  const admin = getSupabaseAdmin();
  const eventId = getEventId();
  const flatDisplay = displayFlatNumber(input.flatNumber);
  const flatNormalized = normalizeFlatNumber(flatDisplay);
  const editToken = generateEditToken();
  const editTokenHash = hashEditToken(editToken);

  const { data: existing } = await admin
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("flat_number", flatNormalized)
    .eq("is_active", true)
    .maybeSingle();

  if (existing) {
    const err = new Error("ALREADY_REGISTERED");
    throw err;
  }

  const { data, error } = await admin
    .from("registrations")
    .insert({
      event_id: eventId,
      flat_number: flatNormalized,
      flat_number_display: flatDisplay,
      resident_name: input.residentName,
      head_count: input.headCount,
      edit_token_hash: editTokenHash,
      is_active: true,
    })
    .select(
      "id, flat_number_display, resident_name, head_count, updated_at",
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("ALREADY_REGISTERED");
    }
    throw new Error(error.message);
  }

  return {
    registration: {
      id: data.id,
      flatNumber: data.flat_number_display,
      residentName: data.resident_name,
      headCount: data.head_count,
      updatedAt: data.updated_at,
    },
    editToken,
  };
}

export async function getRegistrationByEditToken(token: string) {
  const admin = getSupabaseAdmin();
  const eventId = getEventId();
  const tokenHash = hashEditToken(token);

  const { data, error } = await admin
    .from("registrations")
    .select(
      "id, flat_number_display, resident_name, head_count, updated_at, edit_token_hash, is_active, event_id",
    )
    .eq("event_id", eventId)
    .eq("edit_token_hash", tokenHash)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  if (!verifyEditToken(token, data.edit_token_hash)) return null;

  return {
    id: data.id,
    flatNumber: data.flat_number_display as string,
    residentName: data.resident_name as string | null,
    headCount: data.head_count as number,
    updatedAt: data.updated_at as string,
  } satisfies PublicRegistrationView;
}

export async function updateRegistrationByEditToken(
  token: string,
  input: {
    flatNumber: string;
    headCount: number;
    residentName: string | null;
  },
): Promise<PublicRegistrationView> {
  const admin = getSupabaseAdmin();
  const eventId = getEventId();
  const tokenHash = hashEditToken(token);

  const { data: current, error: findError } = await admin
    .from("registrations")
    .select("id, edit_token_hash")
    .eq("event_id", eventId)
    .eq("edit_token_hash", tokenHash)
    .eq("is_active", true)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!current || !verifyEditToken(token, current.edit_token_hash)) {
    throw new Error("NOT_FOUND");
  }

  const flatDisplay = displayFlatNumber(input.flatNumber);
  const flatNormalized = normalizeFlatNumber(flatDisplay);

  const { data: conflict } = await admin
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("flat_number", flatNormalized)
    .eq("is_active", true)
    .neq("id", current.id)
    .maybeSingle();

  if (conflict) {
    throw new Error("FLAT_CONFLICT");
  }

  const { data, error } = await admin
    .from("registrations")
    .update({
      flat_number: flatNormalized,
      flat_number_display: flatDisplay,
      resident_name: input.residentName,
      head_count: input.headCount,
    })
    .eq("id", current.id)
    .select("id, flat_number_display, resident_name, head_count, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("FLAT_CONFLICT");
    throw new Error(error.message);
  }

  return {
    id: data.id,
    flatNumber: data.flat_number_display,
    residentName: data.resident_name,
    headCount: data.head_count,
    updatedAt: data.updated_at,
  };
}

export async function listRegistrationsForAdmin(search?: string) {
  const admin = getSupabaseAdmin();
  const eventId = getEventId();

  let query = admin
    .from("registrations")
    .select(
      "id, event_id, flat_number, flat_number_display, resident_name, head_count, is_active, created_at, updated_at",
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    const q = normalizeFlatNumber(search);
    query = query.or(
      `flat_number.ilike.%${q}%,flat_number_display.ilike.%${search.trim()}%,resident_name.ilike.%${search.trim()}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpdateRegistration(
  id: string,
  patch: {
    flatNumber?: string;
    headCount?: number;
    residentName?: string | null;
    isActive?: boolean;
  },
) {
  const admin = getSupabaseAdmin();
  const eventId = getEventId();

  const update: Record<string, unknown> = {};
  if (patch.flatNumber !== undefined) {
    const display = displayFlatNumber(patch.flatNumber);
    update.flat_number_display = display;
    update.flat_number = normalizeFlatNumber(display);
  }
  if (patch.headCount !== undefined) update.head_count = patch.headCount;
  if (patch.residentName !== undefined) update.resident_name = patch.residentName;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;

  const { data, error } = await admin
    .from("registrations")
    .update(update)
    .eq("id", id)
    .eq("event_id", eventId)
    .select(
      "id, event_id, flat_number, flat_number_display, resident_name, head_count, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("FLAT_CONFLICT");
    throw new Error(error.message);
  }

  return data;
}

export async function adminSoftDeleteRegistration(id: string) {
  return adminUpdateRegistration(id, { isActive: false });
}
