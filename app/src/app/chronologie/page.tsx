import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import SectionClient from "@/components/SectionClient";

const FIELDS = [
  { key: "title", label: "Titre", type: "text" as const, required: true },
  { key: "dateLabel", label: "Date", type: "text" as const },
  { key: "description", label: "Description", type: "textarea" as const },
  { key: "notes", label: "Notes", type: "textarea" as const },
];

export default async function ChronologiePage() {
  const session = await getSession();
  if (!session) redirect("/");

  const items = await prisma.event.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <PageHeader title="Chronologie" isAdmin={session.role === "ADMIN"} />
      <SectionClient
        items={items}
        apiBase="/api/chronologie"
        isAdmin={session.role === "ADMIN"}
        fields={FIELDS}
        titleKey="title"
        subtitleKey="dateLabel"
      />
    </>
  );
}
