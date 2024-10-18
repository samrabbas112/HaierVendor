export default [
  {
    title: 'Dashboards',
    to: { name: 'dashboard' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Orders',
    icon: { icon: 'tabler-shopping-cart' },
    children: [
      {
        title: 'Haier Orders',
        to: { name: 'order-list-haier' },
      },
      {
        title: 'Vendor Orders',
        to: { name: 'order-list' },
      },
    ],
  },
  {
    title: 'Management',
    icon: { icon: 'tabler-shopping-cart' },
    children: [
      {
        title: 'Vendors',
        to: { name: 'management-vendors' },
      },
      {
        title: 'Customers',
        to: { name: 'management-customers' },
      },
      {
        title: 'Queries',
        to: { name: 'management-queries' },
      },
    ],
  },
  {
    title: 'Activity',
    icon: { icon: 'tabler-activity' },
    children: [
      {
        title: 'cashback',
        to: { name: 'activity-cashback' },
      }
    ]
  }

]
