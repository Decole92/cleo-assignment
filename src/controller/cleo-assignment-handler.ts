import { RequestHandler } from 'express';
import { CachedData, FetchFunction, FetchResult } from 'typing';

const dataset = [
  {
    id: 1,
    data: [{ price: 0, time: '2023-01-01' }],
  },
  {
    id: 2,
    data: [
      { price: 1, time: '2023-01-01' },
      { price: 0, time: '2023-01-02' },
      { price: 1, time: '2023-01-03' },
    ],
  },
];

export const createHandler = (ttl: number, fetchFunc: FetchFunction): RequestHandler => {
    const cache: Map<number, CachedData> = new Map();
    const handler: RequestHandler = async (req, res) => {
    const id = Number(req.query.id);
    if (isNaN(id) || id < 0) {
      res.status(400).json({
        success: false,
        error: "Something went wrong",
        result: null,
      });
      return;
    }

    // Check if the data is in the cache
    const cachedData = cache.get(id);
    if (cachedData && Date.now() < cachedData.expiresAt) {
      const range = getRangeFromData(cachedData.data);
      console.log('already in cacheddata', range);
      res.json({
        success: true,
        error: null,
        result: { range },
      });
      return;
    }

    // Fetch data from the fetch function
    let data: FetchResult;
    try {
      data = await fetchFunc(id);
      console.log('data from handler', data);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error fetching data',
        result: null,
      });
      return;
    }

    // Cache the data
    const expiresAt = Date.now() + ttl;
    cache.set(id, { data, expiresAt });

    const range = getRangeFromData(data);
    res.json({
      success: true,
      error: null,
      result: { range },
    });
  };

  return handler;
};

const getRangeFromData = (data: FetchResult) => {
  if (data.length === 0) {
    return null;
  }
  console.log('data from getRangefromdata', data);

  // Find the max difference in time between consecutive data points
  let maxTimeDifference = -Infinity;
  let maxTimeIndex = -1;
  for (let i = 1; i < data.length; i++) {
    const timeDifference = data[i].time.getTime() - data[i - 1].time.getTime();
    if (timeDifference > maxTimeDifference) {
      maxTimeDifference = timeDifference;
      maxTimeIndex = i;
    }
  }

  // If no gap exists, return null
  if (maxTimeIndex === -1) {
    return null;
  }

  // Return the range between the two data points with the largest time difference
  const start = data[maxTimeIndex - 1].time.toISOString();
  const end = data[maxTimeIndex].time.toISOString();
  return { start, end };
};





export const fetchFunc: FetchFunction = async (id) => {
  const data = dataset.find((d) => d.id === id);
  if (!data) {
    throw new Error(`Data not found for ID ${id}`);
  }
 const prices = data.data.map((d) => d.price);
 //finding the average price
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  // convert time strings to Date object
   const result = data.data
    .filter((d) => d.price > avgPrice)
    .map((d) => ({
      price: d.price,
      time: new Date(d.time),
    }));
    console.log('result from fetchFunc', result);
    return result;
};
