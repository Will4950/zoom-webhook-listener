import {clearEvents, events, writeLocal} from './lowdb.js';
import {setAuthtoken} from './ngrok.js';
import {Server} from 'socket.io';
import {Parser, transforms} from 'json2csv';

const json2csv = new Parser({
	transforms: [transforms.flatten({objects: true, arrays: true})]
});

const io = new Server({
	serveClient: false,
	pingInterval: 3500
});

function socketsHandler(socket) {
	socket.on('event', async (data, res) => {
		if (data === 'webhookClear') {
			await clearEvents();
			res();
		}
		if (data === 'webhookToCSV') {
			if (events.length === 0) return;
			let webhookCSV = await json2csv.parse(events);
			res(webhookCSV);
		}
	});
	socket.on('getEvents', async () => {
		for (let i in events) {
			socket.emit('event', events[i]);
		}
	});
	socket.on('save', async (data) => {
		await writeLocal(data.id, data.value);
		if (data.id === 'authtoken') await setAuthtoken(data.value);
	});
}

io.on('connection', socketsHandler);

export default io;
