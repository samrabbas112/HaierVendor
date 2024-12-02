export default [
  {
    title: 'Dashboards',
    to: { name: 'dashboard' },
    icon: { icon: 'tabler-smart-home' },
    action: 'read',
    subject: 'Vendor',
  },
  {
    title: 'Orders',
    icon: { icon: 'tabler-shopping-cart' },
    action: 'read',
    subject: 'Vendor',
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
        subject: 'Vendor',
      },
      {
        title: 'Private Orders',
        to: { name: 'order-private' },
        action: 'read',
        subject: 'Vendor',
      },
      {
        title: 'Lahore Orders',
        to: { name: 'order-lahore' },
        action: 'read',
        subject: 'Vendor',
      },
    ],
  },
  {
    title: 'Management',
    icon: { icon: 'tabler-device-imac-cog' },
    action: 'read',
    subject: 'Vendor',
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
        subject: 'Vendor',
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
