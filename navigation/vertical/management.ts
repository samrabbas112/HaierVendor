export default [
  {
    heading: "Management",
    action: "read",
    subject: "Customer",
  },
  {
    title: "Management",
    icon: { icon: "tabler-device-imac-cog" },
    action: "read",
    subject: "Management",
    children: [
      {
        title: "Vendors",
        to: { name: "management-vendors" },
        action: "read",
        subject: "Admin",
      },
      {
        title: "Customers",
        to: { name: "management-customers" },
        action: "read",
        subject: "Customer",
      },
      {
        title: "Queries",
        to: { name: "management-queries" },
        action: "read",
        subject: "Admin",
      },
    ],
  },
];
