export default [
  {
    heading: 'Order Management',
    action: 'read',
    subject: 'Customer',
  },
  {
    title: 'Private Orders',
    to: {name: 'order-private'},
    icon: { icon: 'tabler-menu-2' },
    action: 'read',
    subject: 'Vendor',
  },
  {
    title: 'Public Orders',
    to: {name: 'order-lahore'},
    icon: { icon: 'tabler-files' },
    action: 'read',
    subject: 'Vendor',
  },
  {
    title: 'Haier Orders',
    icon: { icon: 'tabler-menu-2' },
    to: {name: 'order-admin-haier'},
    action: 'read',
    subject: 'Admin',
  },
  {
    title: 'Vendor Orders',
    icon: { icon: 'tabler-command' },
    to: {name: 'order-admin-vendor'},
    action: 'read',
    subject: 'Admin',
  },
  {
    title: 'My Orders',
    to: {name: 'order-my'},
    icon: { icon: 'tabler-command' },
    action: 'read',
    subject: 'Vendor',
  },

]

