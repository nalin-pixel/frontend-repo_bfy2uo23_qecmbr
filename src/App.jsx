import { useEffect, useMemo, useState } from "react";
import RestaurantCard from "./components/RestaurantCard";
import MenuItemCard from "./components/MenuItemCard";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [selected, setSelected] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function boot() {
      try {
        const res = await fetch(`${API_BASE}/restaurants`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (!data || data.length === 0) {
          // try to seed demo data
          await fetch(`${API_BASE}/seed`, { method: "POST" });
          const res2 = await fetch(`${API_BASE}/restaurants`);
          const d2 = await res2.json();
          setRestaurants(d2);
        } else {
          setRestaurants(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingRestaurants(false);
      }
    }
    boot();
  }, []);

  useEffect(() => {
    async function loadMenu() {
      if (!selected) return;
      const res = await fetch(`${API_BASE}/menu/${selected.id}`);
      const data = await res.json();
      setMenu(data);
    }
    loadMenu();
  }, [selected]);

  const filteredRestaurants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(r => r.name.toLowerCase().includes(q) || (r.cuisine||[]).join(" ").toLowerCase().includes(q));
  }, [restaurants, search]);

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(p => p.id !== id));
  }

  function changeQty(id, delta) {
    setCart(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p));
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  async function placeOrder() {
    if (!selected || cart.length === 0) return;
    setPlacing(true);
    try {
      const payload = {
        restaurant_id: selected.id,
        customer_name: "Guest User",
        customer_phone: "0000000000",
        customer_address: "123 Main St",
        items: cart.map(c => ({ item_id: c.id, name: c.name, price: c.price, quantity: c.qty }))
      };
      const res = await fetch(`${API_BASE}/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      alert(`Order placed! Total $${data.total}`);
      setCart([]);
    } catch (e) {
      console.error(e);
      alert("Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-10 backdrop-blur bg-slate-900/70 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <img src="/flame-icon.svg" className="w-8 h-8" />
          <h1 className="font-bold text-xl">Flames Food</h1>
          <div className="flex-1" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search restaurants or cuisines" className="w-72 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
          <div className="ml-4 font-medium text-blue-300">Cart: {cart.reduce((s,i)=>s+i.qty,0)} items (${total.toFixed(2)})</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 space-y-6">
          <h2 className="text-lg text-slate-300">Popular Near You</h2>
          {loadingRestaurants ? (
            <div className="text-slate-400">Loading restaurants...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredRestaurants.map(r => (
                <RestaurantCard key={r.id} restaurant={r} onSelect={setSelected} />
              ))}
            </div>
          )}

          {selected && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-semibold">{selected.name} Menu</h3>
                <span className="text-slate-400 text-sm">{selected.cuisine?.join(", ")} • {selected.delivery_time_mins} mins</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {menu.map(m => (
                  <MenuItemCard key={m.id} item={m} onAdd={addToCart} />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="md:col-span-1">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sticky top-24">
            <h3 className="font-semibold mb-4">Your Cart</h3>
            {cart.length === 0 ? (
              <div className="text-slate-400 text-sm">Add items to your cart</div>
            ) : (
              <div className="space-y-3">
                {cart.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-slate-400">${c.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>changeQty(c.id, -1)} className="px-2 py-1 bg-slate-800 rounded">-</button>
                      <div>{c.qty}</div>
                      <button onClick={()=>changeQty(c.id, 1)} className="px-2 py-1 bg-slate-800 rounded">+</button>
                      <button onClick={()=>removeFromCart(c.id)} className="px-2 py-1 bg-red-600/80 hover:bg-red-600 rounded text-white">x</button>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="font-semibold">Total</div>
                  <div>${total.toFixed(2)}</div>
                </div>
                <button disabled={placing || cart.length===0} onClick={placeOrder} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed">{placing ? "Placing..." : "Place Order"}</button>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
