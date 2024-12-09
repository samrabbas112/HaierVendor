export default [
  {
    title: 'Dashboards',
    to: { name: 'dashboard' },
    icon: { icon: 'tabler-smart-home' },
    action: 'read',
    subject: 'Dashboard',
  },
  {
    title: 'Orders',
    icon: { icon: 'tabler-shopping-cart' },
    action: 'read',
    subject: 'Order',
    children: [
      {
        title: 'Haier Orders',
        to: { name: 'order-list-haier' },
        action: 'read',
        subject: 'Admin',
      },
      {
        title: 'Vendor Orders',
        to: { name: 'order-list' },
        action: 'read',
        subject: 'Admin',
      },
      {
        title: 'My Orders',
        to: { name: 'order-my' },
        action: 'read',
        subject: 'Order',
      },
      {
        title: 'Private Orders',
        to: { name: 'order-private' },
        action: 'read',
        subject: 'Order',
      },
      {
        title: 'Public Orders',
        to: { name: 'order-lahore' },
        action: 'read',
        subject: 'Order',
      },
    ],
  },
  {
    title: 'Management',
    icon: { icon: 'tabler-device-imac-cog' },
    action: 'read',
    subject: 'Management',
    children: [
      {
        title: 'Vendors',
        to: { name: 'management-vendors' },
        action: 'read',
        subject: 'Admin',
      },
      {
        title: 'Customers',
        to: { name: 'management-customers' },
        action: 'read',
        subject: 'Customer',
      },
      {
        title: 'Queries',
        to: { name: 'management-queries' },
        action: 'read',
        subject: 'Admin',
      },
    ],
  },
  {
    title: 'Activity',
    icon: { icon: 'tabler-activity' },
    action: 'read',
    subject: 'Admin',
    children: [
      {
        title: 'Cashback',
        to: { name: 'activity-cashback' },
      }
    ]
  }

]
