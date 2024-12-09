import { createMongoAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'
import type { Rule } from './ability'

export default defineNuxtPlugin(nuxtApp => {
  const userAbilityRules = useCookie<Rule[]>('userAbilityRules')
  // userAbilityRules.value = [
  //   { action: 'read', subject: 'Vendor' },
  //   { action: 'read', subject: 'Customer' },
  //   { action: 'read', subject: 'Management' },
  //   { action: 'read', subject: 'Order' },
  //   { action: 'read', subject: 'Dashboard' },
  // ]
  const initialAbility = createMongoAbility(userAbilityRules.value ?? [])

  nuxtApp.vueApp.use(abilitiesPlugin, initialAbility, {
    useGlobalProperties: true,
  })
})
