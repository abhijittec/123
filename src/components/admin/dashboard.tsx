"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Download,
  Loader2,
  LogOut,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RegistrationRow = {
  id: string;
  flat_number_display: string;
  resident_name: string | null;
  head_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type AdminStats = {
  stats: { totalFlats: number; totalParticipants: number };
  totals: {
    activeFlats: number;
    inactiveFlats: number;
    averageHeadCount: number;
  };
  byDay: { date: string; count: number }[];
  headCountBuckets: { label: string; count: number }[];
  admin: { email: string | null; displayName: string | null; role: string };
};

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<RegistrationRow | null>(null);
  const [editFlat, setEditFlat] = useState("");
  const [editName, setEditName] = useState("");
  const [editHead, setEditHead] = useState(1);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (q?: string) => {
    setError(null);
    try {
      const [statsRes, listRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch(
          `/api/admin/registrations${q ? `?search=${encodeURIComponent(q)}` : ""}`,
          { cache: "no-store" },
        ),
      ]);

      if (statsRes.status === 401 || listRes.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (!statsRes.ok || !listRes.ok) {
        throw new Error("Failed to load admin data");
      }

      const statsJson = (await statsRes.json()) as AdminStats;
      const listJson = (await listRes.json()) as { registrations: RegistrationRow[] };
      setStats(statsJson);
      setRows(listJson.registrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Initial dashboard fetch from authenticated admin APIs.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount fetch
    void load();
  }, [load]);

  const activeRows = useMemo(() => rows.filter((r) => r.is_active), [rows]);

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  function openEdit(row: RegistrationRow) {
    setEditing(row);
    setEditFlat(row.flat_number_display);
    setEditName(row.resident_name ?? "");
    setEditHead(row.head_count);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/registrations/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flatNumber: editFlat,
          residentName: editName || null,
          headCount: editHead,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      setEditing(null);
      await load(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(row: RegistrationRow) {
    if (!window.confirm(`Deactivate registration for ${row.flat_number_display}?`)) {
      return;
    }
    const res = await fetch(`/api/admin/registrations/${row.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Unable to deactivate");
      return;
    }
    await load(search);
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-64 bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 bg-white/10" />
          <Skeleton className="h-28 bg-white/10" />
          <Skeleton className="h-28 bg-white/10" />
        </div>
        <Skeleton className="h-72 bg-white/10" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-saffron">Committee Admin</p>
          <h1 className="mt-2 font-display text-3xl text-gold-gradient">
            Diwali Registration Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as {stats?.admin.displayName || stats?.admin.email} (
            {stats?.admin.role})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-gold/30 bg-white/5 px-4 text-sm hover:bg-white/10"
          >
            View invitation
          </Link>
          <a
            href="/api/admin/export"
            className="gold-button inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </a>
          <Button
            variant="outline"
            className="rounded-full border-gold/30 bg-white/5"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Flats Registered", value: stats?.stats.totalFlats ?? 0 },
          { label: "Participants", value: stats?.stats.totalParticipants ?? 0 },
          { label: "Inactive / Removed", value: stats?.totals.inactiveFlats ?? 0 },
          { label: "Avg Head Count", value: stats?.totals.averageHeadCount ?? 0 },
        ].map((card) => (
          <div key={card.label} className="glass-panel rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-3 font-display text-3xl text-gold-soft">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-3xl p-5">
          <h2 className="font-display text-xl text-gold-soft">Registrations by Day</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.byDay ?? []}>
                <CartesianGrid stroke="rgba(231,197,107,0.12)" vertical={false} />
                <XAxis dataKey="date" stroke="#c9b896" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#c9b896" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#121830",
                    border: "1px solid rgba(231,197,107,0.25)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="count" fill="#e7c56b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5">
          <h2 className="font-display text-xl text-gold-soft">Head Count Mix</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.headCountBuckets ?? []}>
                <CartesianGrid stroke="rgba(231,197,107,0.12)" vertical={false} />
                <XAxis dataKey="label" stroke="#c9b896" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#c9b896" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#121830",
                    border: "1px solid rgba(231,197,107,0.25)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="count" fill="#e8913a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-gold-soft">Registration List</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeRows.length} active · {rows.length} total shown
            </p>
          </div>
          <form
            className="flex w-full max-w-md gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              load(search);
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search flat number or name"
                className="h-11 rounded-xl border-gold/25 bg-navy-deep/40 pl-9"
              />
            </div>
            <Button type="submit" className="gold-button rounded-xl">
              Search
            </Button>
          </form>
        </div>

        <div className="mt-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gold/15 hover:bg-transparent">
                <TableHead>Flat</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Head Count</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No registrations found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} className="border-gold/10">
                    <TableCell className="font-medium text-gold-soft">
                      {row.flat_number_display}
                    </TableCell>
                    <TableCell>{row.resident_name || "—"}</TableCell>
                    <TableCell>{row.head_count}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatWhen(row.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          row.is_active
                            ? "border-gold/40 text-gold-soft"
                            : "border-white/20 text-muted-foreground"
                        }
                      >
                        {row.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-gold/25 bg-white/5"
                        onClick={() => openEdit(row)}
                        aria-label={`Edit ${row.flat_number_display}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {row.is_active ? (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-destructive/30 bg-destructive/10"
                          onClick={() => deactivate(row)}
                          aria-label={`Deactivate ${row.flat_number_display}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="border-gold/20 bg-[#121830] text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-gold-soft">
              Edit Registration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-flat">Flat Number</Label>
              <Input
                id="edit-flat"
                value={editFlat}
                onChange={(e) => setEditFlat(e.target.value)}
                className="border-gold/25 bg-navy-deep/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Resident Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border-gold/25 bg-navy-deep/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-head">Head Count</Label>
              <Input
                id="edit-head"
                type="number"
                min={1}
                max={30}
                value={editHead}
                onChange={(e) => setEditHead(Number(e.target.value))}
                className="border-gold/25 bg-navy-deep/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gold/25"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button className="gold-button" onClick={saveEdit} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
