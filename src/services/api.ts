import type { ApiResponse, CreateBoardResponse, Board, CanvasElement } from '@/types'

const BASE_URL = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return { success: true, data }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export const api = {
  createBoard: (title?: string) =>
    request<CreateBoardResponse>('/board/create', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'Untitled Board' }),
    }),

  getBoard: (id: string) =>
    request<{ board: Board; elements: CanvasElement[] }>(`/board/${id}`),

  deleteBoard: (id: string) =>
    request<void>(`/board/${id}`, { method: 'DELETE' }),

  exportJson: (id: string) =>
    request<{ board: Board; elements: CanvasElement[] }>(`/board/${id}/export/json`),

  exportPng: async (id: string): Promise<Blob | null> => {
    try {
      const res = await fetch(`${BASE_URL}/board/${id}/export/png`)
      if (!res.ok) return null
      return await res.blob()
    } catch {
      return null
    }
  },
}
