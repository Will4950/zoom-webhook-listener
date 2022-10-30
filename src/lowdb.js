import logger from './logger.js';
import {Low} from 'lowdb';
import {Memory} from 'lowdb';

const adapter = new Memory();
const db = new Low(adapter);

await db.read();
db.data ||= {
	events: [],
	locals: {}
};

export const {events} = db.data;
export const {locals} = db.data;

export async function writeEvent(event) {
	events.push(event);
}

export async function clearEvents() {
	events.length = 0;
}

export async function writeLocal(key, value) {
	logger.silly(`writeLocal | ${key} : ${value}`);
	locals[key] = value;
}
