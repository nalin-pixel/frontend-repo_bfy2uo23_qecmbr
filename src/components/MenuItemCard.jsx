export default function MenuItemCard({ item, onAdd }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden p-4 flex gap-4">
      {item.image_url && (
        <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
      )}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h4 className="text-white font-semibold">{item.name}</h4>
          <div className="text-blue-300 font-medium">${item.price?.toFixed?.(2) ?? item.price}</div>
        </div>
        <p className="text-slate-300/80 text-sm line-clamp-2">{item.description}</p>
        <div className="mt-2 text-xs text-slate-400">{item.category} {item.veg ? "• Veg" : ""} {item.spicy ? "• Spicy" : ""}</div>
        <div className="mt-3">
          <button onClick={() => onAdd(item)} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition">Add</button>
        </div>
      </div>
    </div>
  );
}
