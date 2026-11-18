import { Workspace } from "@/components/workspace";
import { getDashboardData } from "@/lib/store";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const data = await getDashboardData();
  return <Workspace initialData={data}/>;
}
