import {localOnly, setLocals, index, incomingWebhook} from './controller.js';
import express from 'express';
const router = express.Router();

router.post('/', express.json(), incomingWebhook);
router.use('/', localOnly, express.static('dist'));
router.use('/', localOnly, express.static('public'));
router.get('/', localOnly, setLocals, index);

router.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		return res.status(400).send({status: 400, message: err.message});
	}
	next();
});

router.use((req, res) => {
	res.sendStatus(404);
});

export default router;
