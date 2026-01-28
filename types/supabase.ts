export interface Member {
  id: string
  name: string
  phone: string  // changed from email: string
  membership_tier: 'basic' | 'premium' | 'vip'
  membership_status: 'active' | 'inactive'
  points: number
  created_at: string
}

export interface Visit {
  id: string
  member_id: string
  visit_date: string
  points_earned: number
}

