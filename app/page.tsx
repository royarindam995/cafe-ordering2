"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function Home() {
  const tableNumber = "1";

  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    const { data } = await supabase
      .from("menu_items")
      .select("*");

    setItems(data || []);
  }
  function addToCart(item: any) {
  const existing = cart.find(
    (cartItem) => cartItem.id === item.id
  );

  if (existing) {
    setCart(
      cart.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              quantity:
                (cartItem.quantity || 1) + 1,
            }
          : cartItem
      )
    );
  } else {
    setCart([
      ...cart,
      {
        ...item,
        quantity: 1,
      },
    ]);
  }
}
function increaseQty(id: string) {
  setCart(
    cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity:
              (item.quantity || 1) + 1,
          }
        : item
    )
  );
}

function decreaseQty(id: string) {
  setCart(
    cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                (item.quantity || 1) - 1,
            }
          : item
      )
      .filter(
        (item) => (item.quantity || 1) > 0
      )
  );
}

function removeItem(id: string) {
  setCart(
    cart.filter((item) => item.id !== id)
  );
}

  const subtotal = cart.reduce(
  (sum, item) =>
    sum +
    Number(item.price) *
      Number(item.quantity || 1),
  0
);

  const total = subtotal + tip;

  async function placeOrder() {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
const { data, error } = await supabase
  .from("orders")
  .insert([
    {
      table_number: tableNumber,
      items: cart,
      total,
      tip,
      status: "new",
    },
  ])
  .select()
  .single();

if (error) {
  alert(error.message);
  return;
}

setCart([]);
setTip(0);

window.location.href = `/track?id=${data.id}`;
  }
  return (
    <main
      className="min-h-screen p-8 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600')",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-xl">
          <h1 className="text-5xl font-bold text-gray-900">
            ☕ Arindam Cafe
          </h1>

          <p className="text-gray-700 mt-2">
            Fresh Coffee • Snacks • Desserts
          </p>

          <div className="mt-4 inline-block bg-amber-700 text-white px-4 py-2 rounded-full font-bold">
            Table #{tableNumber}
          </div>
        </div>

        {/* Menu */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition duration-300"
            >
             <img
  src={item.image_url}
  alt={item.name}
  className="w-full h-56 object-cover"
/> 

              <div className="p-5">
                <h2 className="text-2xl font-bold text-gray-900">
                  {item.name}
                </h2>

                <p className="text-amber-700 text-xl font-semibold mt-2">
                  ₹{item.price}
                </p>

                <button
                  onClick={() => addToCart(item)}
                  className="mt-4 w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-xl font-semibold"
                >
                  Add To Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="fixed bottom-6 right-6 bg-black text-white p-5 rounded-2xl shadow-2xl w-[340px] max-h-[80vh] overflow-y-auto">
  <h3 className="font-bold text-xl mb-3">
    🛒 Cart
  </h3>

  {cart.length === 0 ? (
    <p className="text-gray-400">
      Your cart is empty
    </p>
  ) : (
    <div className="space-y-3">
      {cart.map((item) => (
        <div
          key={item.id}
          className="bg-gray-800 p-3 rounded-xl"
        >
          <div className="flex justify-between">
            <span>{item.name}</span>

            <button
              onClick={() =>
                removeItem(item.id)
              }
            >
              ❌
            </button>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  decreaseQty(item.id)
                }
                className="bg-red-600 px-2 rounded"
              >
                -
              </button>

              <span>
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  increaseQty(item.id)
                }
                className="bg-green-600 px-2 rounded"
              >
                +
              </button>
            </div>

            <span>
              ₹
              {item.price *
                item.quantity}
            </span>
          </div>
        </div>
      ))}
    </div>
  )}

  <div className="mt-4">
    <p>Subtotal: ₹{subtotal}</p>
    <p>Tip: ₹{tip}</p>

    <p className="text-green-400 font-bold text-lg mt-2">
      Total: ₹{total}
    </p>
  </div>

  <button
    onClick={placeOrder}
    className="mt-4 w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold"
  >
    Place Order
  </button>
</div>
    </main>
  );
}