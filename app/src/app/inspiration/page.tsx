import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import InspirationClient from "@/components/InspirationClient";

export default async function InspirationPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const [themes, places] = await Promise.all([
    prisma.inspirationTheme.findMany({
      orderBy: { name: "asc" },
      include: { morphemes: { orderBy: [{ origin: "asc" }, { type: "asc" }] } },
    }),
    prisma.inspirationPlace.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Inspiration" />
      <InspirationClient
        initialThemes={themes}
        initialPlaces={places}
        isAdmin={session.role === "ADMIN"}
      />
    </>
  );
}
