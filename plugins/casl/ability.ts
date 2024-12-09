import { createMongoAbility } from '@casl/ability'

export type Actions = 'create' | 'read' | 'update' | 'delete'

// ex: Post, Comment, User, etc. We haven't used any of these in our demo though.
export type Subjects = 'Vendor' | 'Customer' | 'all' | 'Management' | 'Order' | 'Dashboard'

export interface Rule { action: Actions; subject: Subjects }

export const ability = createMongoAbility<[Actions, Subjects]>()
