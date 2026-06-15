import client from './client'
import type {
  ContentItem, ContentStatus, ContentType,
  Lead, Thread, SentEmail, SocialAccount, ScheduledPost, ListResponse, Platform,
} from '../types'

// Content
export const getContent = (params?: { status?: ContentStatus | 'all'; type?: ContentType }) =>
  client.get<ListResponse<ContentItem>>('/content', { params }).then(r => r.data)

export const getContentItem = (id: string) =>
  client.get<ContentItem>(`/content/${id}`).then(r => r.data)

export const approveContent = (id: string) =>
  client.put(`/content/${id}/approve`).then(r => r.data)

export const rejectContent = (id: string, note: string) =>
  client.put(`/content/${id}/reject`, { note }).then(r => r.data)

export const scheduleContent = (id: string, scheduled_at: string, platforms: Platform[]) =>
  client.put(`/content/${id}/schedule`, { scheduled_at, platforms }).then(r => r.data)

// Leads
export const getLeads = () =>
  client.get<ListResponse<Lead>>('/leads').then(r => r.data)

export const createLead = (data: Omit<Lead, 'id' | 'last_contacted' | 'notes'>) =>
  client.post<Lead>('/leads', data).then(r => r.data)

export const updateLead = (id: string, data: Partial<Lead>) =>
  client.put<Lead>(`/leads/${id}`, data).then(r => r.data)

export const deleteLead = (id: string) =>
  client.delete(`/leads/${id}`).then(r => r.data)

// Inbox
export const getThreads = () =>
  client.get<ListResponse<Thread>>('/inbox').then(r => r.data)

export const getThread = (threadId: string) =>
  client.get<Thread>(`/inbox/${threadId}`).then(r => r.data)

export const replyToThread = (threadId: string, text: string) =>
  client.post(`/inbox/${threadId}/reply`, { text }).then(r => r.data)

export const markThreadRead = (threadId: string) =>
  client.patch(`/inbox/${threadId}/read`).then(r => r.data)

export const sendEmail = (data: { to: string; subject: string; body: string }) =>
  client.post('/inbox/send', data).then(r => r.data)

export const getSentEmails = () =>
  client.get<ListResponse<SentEmail>>('/inbox/sent').then(r => r.data)

// Social
export const getSocialAccounts = () =>
  client.get<ListResponse<SocialAccount>>('/social/accounts').then(r => r.data)

export const disconnectSocialAccount = (platform: Platform) =>
  client.delete(`/social/accounts/${platform}`).then(r => r.data)

export const getScheduledPosts = (status?: 'pending' | 'all') =>
  client.get<ListResponse<ScheduledPost>>('/social/schedule', { params: { status } }).then(r => r.data)

export const cancelScheduledPost = (id: string) =>
  client.delete(`/social/schedule/${id}`).then(r => r.data)
