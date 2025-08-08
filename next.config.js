const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: 'https://taxiapi.kportals.net/api/v1',
    }
};

module.exports = withNextIntl(nextConfig);
