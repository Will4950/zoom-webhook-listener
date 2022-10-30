import 'dotenv/config';
import config from './config.js';
import app from './express.js';
import logger from './logger.js';
import {locals} from './lowdb.js';
import io from './socketio.js';
import {createServer} from 'node:http';
import {ngrokInit, default as ngrok} from './ngrok.js';

function onHup(signal) {
	logger.info(`${signal}`);
}

async function onInt() {
	await shutdown(0);
}

async function onError(error) {
	logger.error(`http | ${error}`);
	await shutdown(1);
}

async function onListening() {
	logger.info(`http | listening on ${config.host}:${config.port}`);
	await ngrokInit();
	logger.info(`ngrok api | ${locals.api}`);
	logger.info(`ngrok url | ${locals.url}`);
	io.attach(server);
}

async function shutdown(code) {
	await ngrok.kill();
	await server.close();
	process.exit(code);
}

process.on('SIGHUP', onHup);
process.on('SIGINT', onInt);

const server = createServer(app);
server.on('error', onError);
server.on('listening', onListening);

server.listen(config.port, config.host);
