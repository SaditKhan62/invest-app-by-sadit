import { useQuery } from "@tanstack/react-query";
import { fetchNews, fetchStockNews } from "@/lib/api";
import { formatTimeSince } from "@/lib/utils";
import { News } from "@shared/schema";

type NewsFeedProps = {
  stockSymbol?: string;
  limit?: number;
};

export default function NewsFeed({ stockSymbol, limit = 3 }: NewsFeedProps) {
  const { data: news, isLoading, error } = useQuery({
    queryKey: stockSymbol ? [`/api/news/stock/${stockSymbol}`] : ["/api/news"],
    queryFn: () => stockSymbol ? fetchStockNews(stockSymbol, limit) : fetchNews(limit),
  });

  return (
    <section className="mb-6">
      <h2 className="text-xl font-bold mb-4 hidden sm:block">
        {stockSymbol ? `${stockSymbol} News` : 'Latest News'}
      </h2>
      
      <div className="glass rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="block p-4 border-b border-white/10">
              <div className="flex">
                <div className="w-20 h-20 rounded-xl bg-white/5 animate-pulse flex-shrink-0 mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-white/5 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-full bg-white/5 animate-pulse rounded mb-1"></div>
                  <div className="h-4 w-2/3 bg-white/5 animate-pulse rounded mb-2"></div>
                  <div className="h-3 w-1/3 bg-white/5 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="p-4 text-center text-secondary">
            Error loading news
          </div>
        ) : news && news.length > 0 ? (
          news.map((item: News, index: number) => (
            <a 
              key={item.id} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`block p-4 hover:bg-white/5 transition-all duration-300 ${
                index < news.length - 1 ? 'border-b border-white/10' : ''
              }`}
            >
              <div className="flex">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex-shrink-0 mr-4 flex items-center justify-center text-white/70 text-xs border border-white/10">
                  {item.source}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-white/70 text-sm mb-2 line-clamp-2">{item.summary}</p>
                  <div className="text-xs text-white/50">
                    {item.source} • {formatTimeSince(new Date(item.publishedAt))}
                  </div>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="p-4 text-center text-white/50">
            No news available
          </div>
        )}
      </div>
    </section>
  );
}
