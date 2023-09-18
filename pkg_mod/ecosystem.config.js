module.exports = {
    apps: [
        {
            name: 'MANAGER',
            script: './index.js',
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            },

        },
    ],
};

