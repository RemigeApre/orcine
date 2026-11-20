import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import SectionClient from "@/components/SectionClient";

const FIELDS = [
  { key: "name", label: "Nom", type: "text" as const, required: true },
  { key: "description", label: "Description", type: "textarea" as const },
  { key: "notes", label: "Notes", type: "textarea" as const },
];

export default async function IdentitePage() {
  const session = await getSession();
  if (!session) redirect("/");

  const items = await prisma.identity.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <PageHeader title="Identite" />
      <SectionClient
        items={items}
        apiBase="/api/identite"
        isAdmin={session.role === "ADMIN"}
        fields={FIELDS}
      />
    </>
  );
}
