import { notFound } from "next/navigation";
import { getMenuItems, getRestaurantBySlug } from "@/lib/queries";
import { FeedbackFlow } from "./flow";

export const dynamic = "force-dynamic";

export default async function CustomerFeedbackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();
  const menu = await getMenuItems(restaurant.id);

  return (
    <main className="min-h-screen w-full">
      <FeedbackFlow restaurant={restaurant} menu={menu} />
    </main>
  );
}
