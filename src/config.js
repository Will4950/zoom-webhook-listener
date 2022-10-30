const config = new Object();
config.host = process.env.HOST || '0.0.0.0';
config.port = process.env.PORT || 8585;
export default config;
