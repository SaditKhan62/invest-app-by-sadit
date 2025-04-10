import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_000_000_000_000) {
    return `${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
  } else if (marketCap >= 1_000_000_000) {
    return `${(marketCap / 1_000_000_000).toFixed(2)}B`;
  } else if (marketCap >= 1_000_000) {
    return `${(marketCap / 1_000_000).toFixed(2)}M`;
  } else {
    return `${marketCap.toFixed(2)}`;
  }
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  } else {
    return volume.toString();
  }
}

export function getColorForChange(change: number | null | undefined): string {
  if (change === null || change === undefined) return 'text-light-300';
  return change >= 0 ? 'text-primary' : 'text-secondary';
}

export function getStockLogo(symbol: string): string {
  const symbolToColor: Record<string, string> = {
    'AAPL': 'bg-blue-600',
    'MSFT': 'bg-green-600',
    'GOOGL': 'bg-yellow-600',
    'AMZN': 'bg-purple-600',
    'TSLA': 'bg-red-600',
    'META': 'bg-blue-500',
    'NVDA': 'bg-green-500',
    'JPM': 'bg-blue-800',
    'V': 'bg-blue-700',
    'WMT': 'bg-blue-400',
    'JNJ': 'bg-red-400',
    'PG': 'bg-blue-300',
    'DIS': 'bg-blue-900',
    'NFLX': 'bg-red-600',
    'PYPL': 'bg-blue-500',
    'COST': 'bg-red-500',
    'AVGO': 'bg-red-700',
    'AMD': 'bg-red-800',
    'CRWD': 'bg-red-900',
    'SMCI': 'bg-green-800'
  };
  
  return symbolToColor[symbol] || 'bg-gray-600';
}

export function getAvatarInitials(firstName?: string, lastName?: string, username?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (username) {
    return username.substring(0, 2).toUpperCase();
  }
  return 'U';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export const timestampToTimeString = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatTimeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
  
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
};
