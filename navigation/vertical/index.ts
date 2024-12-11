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
        to: { name: 'order-admin-haier' },
        action: 'read',
        subject: 'Admin',
      },
      {
        title: 'Vendor Orders',
        to: { name: 'order-admin-vendor' },
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
        title: 'Public Orders',
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
