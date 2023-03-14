export type Dataset = {
    id: number;
    data: {
      price: number;
      time: string;
    }[];
  }
 
export type FetchFunction = ( id: number ) => Promise<FetchResult>;
export type FetchResult = { price: number; time: Date }[];
export type CachedData = {
    data: FetchResult;
    expiresAt: number;
  }


