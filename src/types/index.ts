export type ContentType = 'blog' | 'email' | 'video' | 'research'
export type ContentStatus = 'pending' | 'approved' | 'rejected' | 'scheduled' | 'posted'
export type Platform = 'linkedin' | 'instagram' | 'facebook' | 'youtube'
export type LeadStatus = 'cold' | 'warm' | 'active'

export interface ContentItem {
  id: string
  title: string
  type: ContentType
  status: ContentStatus
  preview: string
  body?: string
  created_at: string
  scheduled_at?: string
  platforms?: Platform[]
}

export interface Lead {
  id: string
  name: string
  email: string
  company: string
  status: LeadStatus
  last_contacted: string
  notes?: string
}

export interface Thread {
  id: string
  contact_name: string
  contact_email: string
  subject: string
  last_reply_at: string
  unread: boolean
  messages?: Message[]
}

export interface Message {
  id: string
  from: string
  body: string
  sent_at: string
  direction: 'inbound' | 'outbound'
}

export interface SocialAccount {
  platform: Platform
  connected: boolean
  account_name?: string
  expires_at?: string
}

export interface ScheduledPost {
  id: string
  content_id: string
  title: string
  platform: Platform
  scheduled_at: string
  status: 'pending' | 'posted' | 'cancelled' | 'failed'
}

export interface ListResponse<T> {
  items: T[]
  count: number
}
