import { useQuery } from "@tanstack/react-query";
import { fetchNews } from "@/lib/api";
import { formatTimeSince, truncateText } from "@/lib/utils";
import { News as NewsType } from "@shared/schema";
import { Link } from "wouter";

export default function News() {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ["/api/news"],
    queryFn: () => fetchNews(20),
  });

  return (
    <div className="px-4 md:px-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold mb-6">Market News</h1>
      
      <div className="bg-dark-700 rounded-lg overflow-hidden">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="block p-4 border-b border-dark-600">
              <div className="flex">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded bg-dark-600 animate-pulse flex-shrink-0 mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-dark-600 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-full bg-dark-600 animate-pulse rounded mb-1"></div>
                  <div className="h-4 w-2/3 bg-dark-600 animate-pulse rounded mb-2"></div>
                  <div className="h-3 w-1/3 bg-dark-600 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="p-6 text-center text-secondary">
            <p>Error loading news</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        ) : news && news.length > 0 ? (
          news.map((item: NewsType, index: number) => (
            <a 
              key={item.id} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`block p-4 hover:bg-dark-600 ${
                index < news.length - 1 ? 'border-b border-dark-600' : ''
              }`}
            >
              <div className="flex">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded bg-dark-500 flex-shrink-0 mr-4 flex items-center justify-center text-dark-300 text-xs">
                  {item.source}
                </div>
                <div>
                  <h2 className="font-semibold mb-1 text-lg">{item.title}</h2>
                  <p className="text-light-500 text-sm mb-2">{truncateText(item.summary, 150)}</p>
                  <div className="flex items-center text-xs text-light-400">
                    <span>{item.source}</span>
                    <span className="mx-2">•</span>
                    <span>{formatTimeSince(new Date(item.publishedAt))}</span>
                    
                    {item.relatedSymbols && item.relatedSymbols.length > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Related: </span>
                        {item.relatedSymbols.map((symbol, i) => (
                          <span key={symbol}>
                            {i > 0 && ", "}
                            <span 
                              className="text-primary hover:underline ml-1 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/stock/${symbol}`;
                              }}
                            >
                              {symbol}
                            </span>
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="p-6 text-center text-light-500">
            <p>No news available</p>
          </div>
        )}
      </div>
    </div>
  );
}
