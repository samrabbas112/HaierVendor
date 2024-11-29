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
      {
        title: 'My Orders',
        to: { name: 'order-my' },
      },
      // {
      //   title: 'Details',
      //   to: { name: 'order-details-id', params: { id: '9042' } },
      // },
      {
        title: 'Private Orders',
        to: { name: 'order-private' },
      },
      {
        title: 'Lahore Orders',
        to: { name: 'order-lahore' },
      },
    ],
  },
  {
    title: 'Management',
    icon: { icon: 'tabler-device-imac-cog' },
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
        title: 'Cashback',
        to: { name: 'activity-cashback' },
      }
    ]
  }

]
