"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();

    const channel = supabase
  .channel("orders-admin")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "orders",
    },
    (payload) => {
      console.log("Admin realtime:", payload);
      loadOrders();
    }
  )
  .subscribe((status) => {
    console.log("Admin channel:", status);
  });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    setOrders(data || []);
  }

  async function markReady(id: string) {
    await supabase
      .from("orders")
      .update({ status: "ready" })
      .eq("id", id);

    loadOrders();
  }

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  return (
    <main
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600')",
      }}
    >
      <div className="min-h-screen bg-black/70 p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl font-extrabold text-white">
            ☕ Cafe Dashboard
          </h1>

          <p className="text-gray-300 mt-2 text-lg">
            Live Orders Management
          </p>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-gray-500 font-medium">
                Total Orders
              </h3>

              <p className="text-4xl font-bold text-black mt-2">
                {orders.length}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-gray-500 font-medium">
                Total Revenue
              </h3>

              <p className="text-4xl font-bold text-green-600 mt-2">
                ₹{totalSales}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-gray-500 font-medium">
                Pending Orders
              </h3>

              <p className="text-4xl font-bold text-orange-500 mt-2">
                {
                  orders.filter(
                    (o) => o.status !== "ready"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Orders */}
          <div className="grid lg:grid-cols-2 gap-8 mt-10">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Top Section */}
                <div className="bg-amber-700 text-white p-5 flex justify-between items-center">
                  <h2 className="text-3xl font-bold">
                    Table {order.table_number}
                  </h2>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${
                      order.status === "ready"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="flex justify-between mb-5">
                    <div>
                      <p className="text-gray-500">
                        Order Total
                      </p>

                      <p className="text-3xl font-bold text-green-700">
                        ₹{order.total}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">
                        Tip
                      </p>

                      <p className="text-2xl font-bold text-orange-600">
                        ₹{order.tip}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-black mb-3">
                    Ordered Items
                  </h3>

                  <div className="space-y-3">
                    {order.items?.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex justify-between"
                      >
                        <span className="font-medium text-black">
                          {item.name}
                        </span>

                        <span className="font-bold text-amber-700">
                          ₹{item.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.status !== "ready" && (
                    <button
                      onClick={() =>
                        markReady(order.id)
                      }
                      className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition"
                    >
                      ✅ Mark Order Ready
                    </button>
                  )}

                  {order.status === "ready" && (
                    <div className="mt-6 w-full bg-green-100 text-green-700 py-4 rounded-xl text-center font-bold">
                      Order Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}