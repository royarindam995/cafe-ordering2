"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
export default function Home() {

const [tableNumber, setTableNumber] = useState("1");



  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
const [category, setCategory] = useState("All");
const [tip, setTip] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const cartCount = cart.reduce(
  (sum, item) => sum + (item.quantity || 1),
  0
);

  useEffect(() => {
  loadMenu();

  const table =
    new URLSearchParams(window.location.search).get("table") || "1";

  setTableNumber(table);
}, []);

  async function loadMenu() {
  const { data } = await supabase
    .from("menu_items")
    .select("*");

  console.log("MENU DATA:", data);

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
      className="min-h-screen p-4 md:p-8 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600')",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-xl">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            ☕ Arindam Cafe
          </h1>
          <button
  onClick={() => setShowCart(true)}
  className="fixed top-3 right-3 z-50 bg-black text-white px-3 py-2 rounded-xl text-sm md:text-lg"
>
  🛒 Cart ({cartCount})
</button>

          <p className="text-gray-700 mt-2">
            Fresh Coffee • Snacks • Desserts
          </p>

          <div className="mt-4 inline-block bg-amber-700 text-white px-4 py-2 rounded-full font-bold">
            Table #{tableNumber}
          </div>
        </div>

        {/* Menu */}
        <div className="mb-6">
  <div className="mb-6">
  <input
    type="text"
    placeholder="🔍 Search food..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full p-4 rounded-xl border border-gray-300 text-black bg-white"
  />
</div>
<div className="flex gap-2 mb-6 overflow-x-auto">
  {[
    { name: "All", icon: "🍽️" },
    { name: "Coffee", icon: "☕" },
    { name: "Snacks", icon: "🍔" },
    { name: "Biriyani", icon: "🍛" },
  ].map((cat) => (
    <button
      key={cat.name}
      onClick={() => setCategory(cat.name)}
      className={`px-4 py-2 rounded-xl whitespace-nowrap font-semibold transition ${
        category === cat.name
          ? "bg-amber-700 text-white"
          : "bg-white text-black"
      }`}
    >
      {cat.icon} {cat.name}
    </button>
  ))}
</div>
</div>
<div className="mb-4">
  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="w-full p-3 rounded-xl border border-gray-300 text-black bg-white"
  >
    <option value="default">Sort By</option>
    <option value="priceLow">Price: Low to High</option>
    <option value="priceHigh">Price: High to Low</option>
    <option value="rating">Highest Rated</option>
  </select>
</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items
  .filter((item) => {
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || item["category"] === category)
    );
  })
  .sort((a, b) => {
    if (sortBy === "priceLow") {
      return Number(a.price) - Number(b.price);
    }

    if (sortBy === "priceHigh") {
      return Number(b.price) - Number(a.price);
    }

    if (sortBy === "rating") {
      return Number(b.rating || 0) - Number(a.rating || 0);
    }

    return 0;
  })
  .map((item) => (
            <div
  key={item.id}
  className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition duration-300"
>
  {item.popular && (
  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
    🔥 Popular
  </div>
)}
             <img
  src={item.image_url}
  alt={item.name}
  className="w-full h-48 md:h-56 object-cover"
/> 

              <div className="p-4 md:p-5">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {item.name}
                </h2>
                
                <p className="text-gray-500 text-sm">
  {item.category}
</p>
<p className="text-yellow-500 font-semibold mt-1">
  ⭐ {item.rating}
</p>
<p className="text-blue-500 text-sm mt-1">
  ⏱️ {item.prep_time} mins
</p>

                <p className="text-amber-700 text-xl font-semibold mt-2">
                  ₹{item.price}
                </p>

                {cart.find((c) => c.id === item.id) ? (
  <div className="mt-4 flex items-center justify-center gap-3">
    <button
      onClick={() => decreaseQty(item.id)}
      className="bg-red-600 text-white px-4 py-2 rounded-lg"
    >
      -
    </button>

    <span className="font-bold text-2xl text-black">
  {cart.find((c) => c.id === item.id)?.quantity}
</span>

    <button
      onClick={() => increaseQty(item.id)}
      className="bg-green-600 text-white px-4 py-2 rounded-lg"
    >
      +
    </button>
  </div>
) : (
  <button
    onClick={() => addToCart(item)}
    className="mt-4 w-full bg-amber-700 hover:bg-amber-800 text-white py-4 rounded-xl font-semibold text-lg"
  >
    Add To Cart
  </button>
)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
{showCart && (
<div className="fixed top-0 right-0 h-screen bg-black text-white p-5 shadow-2xl w-full sm:w-[340px] overflow-y-auto z-50">
  <h3 className="font-bold text-xl mb-3">
    🛒 Cart
  </h3>
  <button
  onClick={() => setShowCart(false)}
  className="mb-4 bg-red-600 px-3 py-2 rounded-lg"
>
  ✕ Close
</button>

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
  <label className="block mb-2 font-semibold">
    Tip Percentage (%)
  </label>

  <input
  type="number"
  min="0"
  max="100"
  placeholder="Enter tip %"
  style={{
    backgroundColor: "white",
    color: "black",
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #ccc",
  }}
  onChange={(e) => {
    const percent = Number(e.target.value) || 0;
    setTip((subtotal * percent) / 100);
  }}
/>
</div>
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
)}
</main>
);
}