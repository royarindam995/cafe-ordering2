"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TrackPage() {
  const orderId = null;

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;

    loadOrder();

    const channel = supabase
  .channel(`order-${orderId}`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "orders",
      filter: `id=eq.${orderId}`,
    },
    (payload) => {
      console.log("Realtime event:", payload);
      setOrder(payload.new);
    }
  )
  .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  async function loadOrder() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    setOrder(data);
  }

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <h1 className="text-2xl font-bold text-black">
            Loading Order...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
      <div className="bg-white p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] text-center max-w-md border border-gray-200">
        <h1 className="text-4xl font-bold text-black mb-4">
          ☕ Order Tracking
        </h1>

        <p className="text-gray-700 font-medium">
          Order ID
        </p>

        <p className="font-mono text-sm break-all mb-6 text-gray-800">
          {order.id}
        </p>

        <div className="text-3xl font-bold text-black">
          {order.status === "ready"
            ? "✅ Ready"
            : "☕ Preparing"}
        </div>

        <p className="mt-4 text-gray-800 text-xl font-semibold">
          Table #{order.table_number}
        </p>

        <p className="mt-2 text-3xl font-bold text-green-600">
          ₹{order.total}
        </p>
      </div>
    </main>
  );
}