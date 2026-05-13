import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export const Categories = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["web-categories-infinite"],
    queryFn: ({ pageParam = 1 }) =>
      api.get(`/api/inventory/categories/?page=${pageParam}`).then((res) => {
        const data = res.data;
        return Array.isArray(data) ? { results: data } : data;
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next, window.location.origin);
        return url.searchParams.get("page");
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const categories = data?.pages.flatMap((page: any) => page.results || []) ?? [];

  // Check scroll position and trigger next page
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Trigger fetch more when reaching the end
      if (scrollLeft + clientWidth >= scrollWidth - 100 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold">Shop by category</h2>
          <p className="text-muted-foreground">Everything you need, sorted fresh.</p>
        </div>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="relative mt-8">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-forest" />
          </button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-forest" />
          </button>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 px-1 scrollbar-hide"
          style={{
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categories.map((c: any) => c && (
            <Link
              key={c.id}
              to={`/category/${c.slug || c.id}`}
              className="group relative flex-shrink-0 w-32 rounded-3xl bg-surface p-6 transition-all hover:bg-mint-soft hover:shadow-soft"
            >
              <div className="mb-4 text-4xl group-hover:scale-110 transition-transform">{c.emoji || "📦"}</div>
              <h3 className="font-display text-lg font-bold line-clamp-2">{c.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-forest">
                Shop <ArrowRight className="h-3 w-3" />
              </p>
            </Link>
          ))}
          {isFetchingNextPage && (
            <div className="flex flex-shrink-0 w-32 items-center justify-center rounded-3xl bg-surface/50">
              <Loader2 className="h-6 w-6 animate-spin text-forest" />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
