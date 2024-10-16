export default [
  {
    title: "Dashboards",
    to: { name: "dashboard" },
    icon: { icon: "tabler-smart-home" },
  },
  {
    title: 'Orders',
    icon: { icon: 'tabler-shopping-cart' },
    children: [
      {
        title: 'Haier Orders',
        to: { name: 'order-list-haier'},
      },
      {
        title: 'Vendor Orders',
        to: { name: 'order-list'},
      },
    ],
  },

];
