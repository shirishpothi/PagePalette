/**
 * API Utilities with retry logic, timeouts, and proper error handling
 * 
 * Solves the issue of API calls not hitting sometimes by:
 * 1. Implementing exponential backoff retry logic
 * 2. Adding request timeouts
 * 3. Providing typed error responses
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Fetch with automatic retry, timeout, and error handling
 * 
 * @param url - The URL to fetch
 * @param options - Extended fetch options including timeout and retries
 * @returns Promise with typed response
 */
export async function fetchWithRetry<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = 10000, // 10 second default timeout
    retries = 3,
    retryDelay = 1000, // Start with 1 second delay
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < retries) {
    attempt++;
    
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: T | undefined;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        // Don't retry client errors (4xx), only server errors (5xx)
        if (response.status >= 400 && response.status < 500) {
          return {
            success: false,
            error: (data as any)?.error || `Request failed with status ${response.status}`,
            status: response.status,
            data,
          };
        }
        
        // Server error - will retry
        throw new Error(`Server error: ${response.status}`);
      }

      return {
        success: true,
        data,
        status: response.status,
      };

    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on abort (timeout) after max attempts
      const isTimeout = lastError.name === 'AbortError';
      const isLastAttempt = attempt >= retries;
      
      if (isLastAttempt) {
        console.error(`API call to ${url} failed after ${retries} attempts:`, lastError.message);
        break;
      }

      // Exponential backoff: 1s, 2s, 4s...
      const delay = retryDelay * Math.pow(2, attempt - 1);
      console.warn(`API call to ${url} failed (attempt ${attempt}/${retries}), retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError?.name === 'AbortError' 
      ? 'Request timed out. Please check your connection and try again.'
      : lastError?.message || 'An unexpected error occurred',
  };
}

/**
 * Convenience method for POST requests with JSON body
 */
export async function postJSON<T = unknown, R = unknown>(
  url: string,
  body: T,
  options: FetchOptions = {}
): Promise<ApiResponse<R>> {
  return fetchWithRetry<R>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * Convenience method for GET requests
 */
export async function getJSON<R = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<R>> {
  return fetchWithRetry<R>(url, {
    method: 'GET',
    ...options,
  });
}
