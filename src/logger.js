import winston from 'winston';

const logger = winston.createLogger({});
logger.add(
	new winston.transports.Console({
		level: process.env.NODE_ENV === 'production' ? 'verbose' : 'silly',
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.timestamp({
				format: 'DD-MM:HH:mm:ss'
			}),
			winston.format.printf(
				(info) => `[${info.timestamp}] [${info.level}] : ${info.message}`
			)
		)
	})
);

export default logger;
