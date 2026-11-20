import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import InspirationClient from "@/components/InspirationClient";

export default async function InspirationPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const [suffixes, places] = await Promise.all([
    prisma.inspirationSuffix.findMany({ orderBy: { value: "asc" } }),
    prisma.inspirationPlace.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Inspiration" isAdmin={session.role === "ADMIN"} />
      <InspirationClient
        initialSuffixes={suffixes}
        initialPlaces={places}
        isAdmin={session.role === "ADMIN"}
      />
    </>
  );
}
