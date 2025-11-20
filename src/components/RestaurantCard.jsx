import { Star } from "lucide-react";

export default function RestaurantCard({ restaurant, onSelect }) {
  return (
    <button onClick={() => onSelect(restaurant)} className="text-left w-full">
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all">
        {restaurant.image_url && (
          <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-40 object-cover" />
        )}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">{restaurant.name}</h3>
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={16} fill="currentColor" />
              <span className="text-sm">{restaurant.rating?.toFixed?.(1) || restaurant.rating}</span>
            </div>
          </div>
          <p className="text-slate-300/80 text-sm line-clamp-1">{restaurant.description}</p>
          <div className="mt-2 text-slate-400 text-xs">{restaurant.cuisine?.join(", ")}</div>
          <div className="mt-2 text-slate-300 text-xs">⏱ {restaurant.delivery_time_mins} mins • {restaurant.location}</div>
        </div>
      </div>
    </button>
  );
}
