import logger from './logger.js';
import {locals, writeEvent} from './lowdb.js';
import io from './socketio.js';
import {createHmac} from 'node:crypto';
import axios from 'axios';

export async function setLocals(req, res, next) {
	res.locals = {...locals};
	next();
}

export function localOnly(req, res, next) {
	const regex =
		'/(^127.)|(^10.)|(^172.1[6-9].)|(^172.2[0-9].)|(^172.3[0-1].)|(^192.168.)|(^localhost)|(^0.0.0.0)/';
	if (req.hostname.match(regex)) {
		next();
	} else {
		res.sendStatus(418); // I'm a Teapot
	}
}

export function index(req, res) {
	res.render('index');
}

export function incomingWebhook(req, res) {
	try {
		if (req.body.event === 'endpoint.url_validation') {
			let hashForPlainToken = createHmac('sha256', locals.secretToken)
				.update(req.body.payload.plainToken)
				.digest('hex');
			res.status(200).json({
				plainToken: req.body.payload.plainToken,
				encryptedToken: hashForPlainToken
			});
			return;
		}
	} catch (e) {
		res.sendStatus(404);
		return;
	}

	try {
		let message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(
			req.body
		)}`;
		let hashForVerify = createHmac('sha256', locals.secretToken)
			.update(message)
			.digest('hex');
		let signature = `v0=${hashForVerify}`;
		if (req.headers['x-zm-signature'] !== signature)
			throw new Error('Invalid signature');
	} catch (e) {
		res.sendStatus(400);
		return;
	}

	res.sendStatus(200);

	let event = {...req.body};
	writeEvent(event);
	io.emit('event', event);

	if (locals.relayStatus) {
		logger.http(`webhookrelay`);
		let url = locals.destinationUrl;
		if (!url) return;
		let headers = {'Content-Type': 'application/json'};
		let authorization = locals.authHeader;
		if (authorization) headers.Authorization = authorization;
		axios({
			method: 'post',
			headers,
			url,
			data: event
		})
			.then((res) => {
				logger.http(`relay | res | ${res.status}`);
			})
			.catch((err) => {
				logger.http(`relay | res | ${err.response.status}`);
			});
	}
}
