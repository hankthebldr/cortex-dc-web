/**
 * React hooks for API data fetching with SWR
 * Provides caching, revalidation, and optimistic updates
 */

import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { apiClient, APIError, ListResponse } from '../api-client';

/**
 * Generic fetcher function for SWR
 */
const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * Hook for fetching user profile
 */
export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/auth/me',
    () => apiClient.getCurrentUser(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    user: data,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching list data
 */
export function useListData<T = any>(
  collection: string,
  params?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    filters?: Record<string, any>;
  }
) {
  const key = `/api/data/${collection}?${JSON.stringify(params)}`;

  const { data, error, isLoading, mutate } = useSWR<ListResponse<T>>(
    key,
    () => apiClient.listData<T>(collection, params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000, // Dedupe requests within 2s
    }
  );

  return {
    data: data?.items || [],
    total: data?.total || 0,
    pagination: data?.pagination,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching single document
 */
export function useData<T = any>(collection: string, id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    id ? `/api/data/${collection}/${id}` : null,
    id ? () => apiClient.getData<T>(collection, id) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

/**
 * Hook for creating data
 */
export function useCreateData<T = any>(collection: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/data/${collection}`,
    async (_key: string, { arg }: { arg: any }) => {
      const result = await apiClient.createData<T>(collection, arg);

      // Revalidate list
      mutate((key) => typeof key === 'string' && key.startsWith(`/api/data/${collection}?`));

      return result;
    }
  );

  return {
    create: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating data
 */
export function useUpdateData<T = any>(collection: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/data/${collection}`,
    async (_key: string, { arg }: { arg: { id: string; data: any } }) => {
      const result = await apiClient.updateData<T>(collection, arg.id, arg.data);

      // Revalidate both detail and list
      mutate(`/api/data/${collection}/${arg.id}`);
      mutate((key) => typeof key === 'string' && key.startsWith(`/api/data/${collection}?`));

      return result;
    }
  );

  return {
    update: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for patching data (partial update)
 */
export function usePatchData<T = any>(collection: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/data/${collection}/patch`,
    async (_key: string, { arg }: { arg: { id: string; updates: any } }) => {
      const result = await apiClient.patchData<T>(collection, arg.id, arg.updates);

      // Revalidate both detail and list
      mutate(`/api/data/${collection}/${arg.id}`);
      mutate((key) => typeof key === 'string' && key.startsWith(`/api/data/${collection}?`));

      return result;
    }
  );

  return {
    patch: trigger,
    isPatching: isMutating,
    error,
  };
}

/**
 * Hook for deleting data
 */
export function useDeleteData(collection: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/data/${collection}/delete`,
    async (_key: string, { arg }: { arg: string }) => {
      await apiClient.deleteData(collection, arg);

      // Revalidate list
      mutate((key) => typeof key === 'string' && key.startsWith(`/api/data/${collection}?`));
    }
  );

  return {
    deleteItem: trigger,
    isDeleting: isMutating,
    error,
  };
}

/**
 * Hook for AI chat
 */
export function useAIChat() {
  const { trigger, isMutating, error, data } = useSWRMutation(
    '/api/ai/chat',
    async (_key: string, { arg }: { arg: { message: string; context?: string; conversationId?: string } }) => {
      return apiClient.aiChat(arg.message, arg.context, arg.conversationId);
    }
  );

  return {
    sendMessage: trigger,
    isSending: isMutating,
    response: data,
    error,
  };
}

/**
 * Hook for file upload
 */
export function useFileUpload() {
  const { trigger, isMutating, error, data } = useSWRMutation(
    '/api/storage/upload',
    async (_key: string, { arg }: { arg: { file: File; path: string; metadata?: Record<string, any> } }) => {
      return apiClient.uploadFile(arg.file, arg.path, arg.metadata);
    }
  );

  return {
    upload: trigger,
    isUploading: isMutating,
    uploadedFile: data,
    error,
  };
}

/**
 * Hook for conversations list
 */
export function useConversations(params?: { limit?: number; offset?: number }) {
  const key = `/api/ai/conversations?${JSON.stringify(params)}`;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => apiClient.getConversations(params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    conversations: data || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

/**
 * Hook for POVs (Proof of Value)
 */
export function usePOVs(userId?: string) {
  return useListData('povs', {
    filters: userId ? { userId } : undefined,
    orderBy: 'createdAt:desc',
  });
}

/**
 * Hook for single POV
 */
export function usePOV(id: string | null | undefined) {
  return useData('povs', id);
}

/**
 * Hook for creating POV
 */
export function useCreatePOV() {
  return useCreateData('povs');
}

/**
 * Hook for updating POV
 */
export function useUpdatePOV() {
  return useUpdateData('povs');
}

/**
 * Hook for deleting POV
 */
export function useDeletePOV() {
  return useDeleteData('povs');
}

/**
 * Hook for TRRs (Technical Readiness Reviews)
 */
export function useTRRs(userId?: string) {
  return useListData('trrs', {
    filters: userId ? { userId } : undefined,
    orderBy: 'createdAt:desc',
  });
}

/**
 * Hook for single TRR
 */
export function useTRR(id: string | null | undefined) {
  return useData('trrs', id);
}

/**
 * Hook for documents
 */
export function useDocuments(filters?: Record<string, any>) {
  return useListData('documents', { filters });
}

/**
 * Utility to manually invalidate cache
 */
export function invalidateCache(pattern: string | ((key: any) => boolean)) {
  mutate(pattern);
}

/**
 * Utility to prefetch data
 */
export async function prefetchData<T = any>(
  collection: string,
  id?: string,
  params?: any
): Promise<T | ListResponse<T>> {
  if (id) {
    return apiClient.getData<T>(collection, id);
  }
  return apiClient.listData<T>(collection, params);
}

/**
 * Hook for dashboard metrics
 */
export function useDashboardMetrics(userId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/metrics/dashboard/${userId}` : '/api/metrics/dashboard',
    () => apiClient.request(`/metrics/dashboard${userId ? `/${userId}` : ''}`),
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    metrics: data,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

/**
 * Hook for recent activity
 */
export function useRecentActivity(userId?: string, limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/activity/recent?userId=${userId || 'me'}&limit=${limit}`,
    () => apiClient.request(`/activity/recent?userId=${userId || 'me'}&limit=${limit}`),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    activities: data?.items || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}
