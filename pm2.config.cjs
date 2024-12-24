module.exports = {
  apps: [
    {
      name: 'nuxt3-app', // Replace with your app name
      script: '.output/server/index.mjs', // Path to the built server entry point
      exec_mode: 'cluster', // Enable cluster mode for better performance
      instances: '3', // Adjust based on CPU cores or set a specific number
    },
  ],
};
