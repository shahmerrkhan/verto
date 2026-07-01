import { handleError } from './_error.js'
import { z } from 'zod'

export function validate(schema, data, res) {
  const result = schema.safeParse(data)
  if (!result.success) {
    res.status(400).json({ error: 'Invalid input', details: result.error.flatten().fieldErrors })
    return null
  }
  return result.data
}

export const schemas = {
  badge: z.object({
    badges: z.array(z.string()).max(50),
  }),

  collection: z.object({
    name: z.string().min(1).max(100),
  }),

  opportunityCollection: z.object({
    opportunityId: z.string().uuid(),
    collectionId: z.string().uuid(),
  }),

  outcome: z.object({
    saveMetaId: z.string().uuid(),
    outcome: z.enum(['won', 'rejected', 'pending', 'withdrawn']),
    note: z.string().max(1000).optional(),
    isPublic: z.boolean(),
    opportunityId: z.string().uuid().optional(),
    displayName: z.string().max(100).optional(),
    school: z.string().max(100).optional(),
    prizeAmount: z.number().optional(),
    opportunityTitle: z.string().max(200).optional(),
    orgName: z.string().max(200).optional(),
  }),

  articleLike: z.object({
    liked: z.boolean(),
  }),

  articleSubmit: z.object({
    authorName: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    excerpt: z.string().max(300).optional(),
    content: z.string().min(1).max(50000),
  }),

  organizerListing: z.object({
    org_name: z.string().min(1).max(200),
    contact_name: z.string().min(1).max(100),
    contact_email: z.string().email(),
    plan: z.string().min(1).max(50),
    notes: z.string().max(1000).optional(),
    monthly_fee: z.number().optional(),
  }),

  mentorApply: z.object({
    full_name: z.string().min(1).max(100),
    email: z.string().email(),
    linkedin_url: z.string().url().optional(),
    bio: z.string().max(2000).optional(),
    role: z.string().max(100).optional(),
    institution: z.string().max(200).optional(),
    skills: z.array(z.string()).optional(),
    opportunity_types: z.array(z.string()).optional(),
    interest_tags: z.array(z.string()).optional(),
  }),
}
