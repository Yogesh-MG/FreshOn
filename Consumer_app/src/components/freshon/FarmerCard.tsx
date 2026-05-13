import { Link } from "react-router-dom";
import type { Farmer } from "@/data/catalog";
import { Star, MapPin } from "lucide-react";
import { getCleanImageUrl } from "@/utils/image-utils";

export const FarmerCard = ({ farmer }: { farmer: Farmer }) => (
  <Link to={`/farmer/${farmer.id}`} className="freshon-card group flex w-64 shrink-0 flex-col overflow-hidden">
    <div className="relative aspect-[4/3] overflow-hidden">
      <img src={getCleanImageUrl(farmer.image)} alt={farmer.name} loading="lazy" width={400} height={300} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth/80 to-transparent p-3">
        <div className="inline-flex items-center gap-1 rounded-full bg-background/95 px-2 py-0.5 text-[10px] font-bold text-forest">
          <Star className="h-3 w-3 fill-harvest text-harvest" /> {farmer.rating}
        </div>
      </div>
    </div>
    <div className="p-3">
      <h4 className="font-display text-sm font-bold">{farmer.name}</h4>
      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" /> {farmer.location}
      </div>
      <p className="mt-2 text-xs text-foreground/80">{farmer.speciality} · {farmer.years} yrs</p>
    </div>
  </Link>
);
