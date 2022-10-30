import config from './config.js';
import logger from './logger.js';
import {locals, writeLocal} from './lowdb.js';
import io from './socketio.js';
import ngrok from 'ngrok';

export async function ngrokInit() {
	try {
		let url = await ngrok.connect({
			proto: 'http',
			addr: config.port
		});
		await writeLocal('url', url);
		await writeLocal('api', ngrok.getUrl());
	} catch (e) {
		logger.error(e.message);
		process.exit(1);
	}
}

export async function setAuthtoken(token) {
	try {
		await ngrok.disconnect();
		let url = await ngrok.connect({
			proto: 'http',
			addr: config.port,
			authtoken: token
		});
		await writeLocal('url', url);
		io.emit('set', {id: 'ngrokURL', value: locals.url});
	} catch (e) {
		logger.error(e.message);
		process.exit(1);
	}
}

export default ngrok;
