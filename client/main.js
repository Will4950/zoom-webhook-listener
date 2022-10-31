/* global $ io bootstrap */

const socket = io({
	transports: ['websocket'],
	reconnectionAttempts: 600,
	reconnectionDelay: 1000,
	reconnectionDelayMax: 3000,
	timeout: 20000
});

socket.io.on('reconnect', () => {
	window.location.reload();
});

socket.io.on('reconnect_attempt', (attempt) => {
	if (attempt >= 2) {
		$('#modal_connecting').modal('show');
	}
});

socket.on('event', (event) => {
	let date = new Date(event.event_ts).toLocaleDateString('en-us') || 'Date';
	let time = new Date(event.event_ts).toLocaleTimeString('en-us') || '00:00:00';
	let eventObj = {
		eventDescription: `<span type='button'>[${date} ${time}] <span class='fw-bold'>${
			event.event || 'unknown event'
		}</span></span>`,
		eventData: event
	};
	$('#webhookTable').bootstrapTable('prepend', eventObj);
});

socket.on('set', (data) => {
	$(`#${data.id}`).text(data.value);
	$(`#${data.id}`).attr('copy', data.value);
});

/* eslint-disable-next-line no-unused-vars */
function detailFormatter(index, row) {
	return '<pre>' + JSON.stringify(row.eventData, null, 2) + '</pre>';
}

/* eslint-disable-next-line no-unused-vars */
function webhookButtons() {
	return {
		btnExportToCsv: {
			text: 'Export to CSV',
			icon: 'bi-file-earmark-arrow-up',
			event: webhookToCSV,
			attributes: {
				title: 'Export webhook event log to .csv'
			}
		},
		btnClearEvents: {
			text: 'Erase Events',
			icon: 'bi-eraser',
			event: webhookClear,
			attributes: {
				title: 'Erase webhook event log'
			}
		}
	};
}

function webhookClear() {
	socket.emit('event', 'webhookClear', () => {
		$('#webhookTable').bootstrapTable('removeAll');
	});
}

function webhookToCSV() {
	const downloadCSV = (content, fileName, mimeType) => {
		const csvdownloadelement = document.createElement('a');
		mimeType = mimeType || 'application/octet-stream';

		if (navigator.msSaveBlob) {
			navigator.msSaveBlob(
				new Blob([content], {
					type: mimeType
				}),
				fileName
			);
		} else if (URL && 'download' in csvdownloadelement) {
			csvdownloadelement.href = URL.createObjectURL(
				new Blob([content], {
					type: mimeType
				})
			);
			csvdownloadelement.setAttribute('download', fileName);
			document.body.appendChild(csvdownloadelement);
			csvdownloadelement.click();
			document.body.removeChild(csvdownloadelement);
		} else {
			location.href =
				'data:application/octet-stream,' + encodeURIComponent(content);
		}
	};
	socket.emit('event', 'webhookToCSV', (res) => {
		downloadCSV(
			res,
			'webhook_events_' + Date.now() + '.csv',
			'text/csv;encoding:utf-8'
		);
	});
}

function save(ele) {
	var value = $(ele).val();

	if ($(ele).attr('id') === 'relayStatus') {
		if (ele.checked) {
			value = true;
		} else {
			value = false;
		}
	}

	socket.emit('save', {
		id: $(ele).attr('id'),
		type: $(ele).prop('tagName'),
		value
	});

	$(ele)
		.css({'box-shadow': 'inset 0 0 0 4px #27874c'})
		.animate({opacity: 1}, 400, 'swing', function () {
			$(ele).css({'box-shadow': ''}).animate({opacity: 1}, 'fast');
		});
}

$(() => {
	$('#webhookTable').bootstrapTable();
	$('#webhookTable').bootstrapTable('refreshOptions', {iconSize: 'sm'});
	socket.emit('getEvents');
	const tooltipTriggerList = document.querySelectorAll(
		'[data-bs-toggle="tooltip"]'
	);
	[...tooltipTriggerList].map(
		(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
	);

	$('.save').on('change', (event) => {
		$(event.currentTarget).val($(event.currentTarget).val().replace(/\s/g, ''));
		save(event.currentTarget);
	});

	$('.showhidepw').on('click', (event) => {
		var target = $('#' + $(event.currentTarget).attr('for'));
		var i = $(event.currentTarget).children('i');
		if (target.attr('type') == 'password') {
			target.attr('type', 'text');
			i.addClass('bi-eye-slash');
			i.removeClass('bi-eye');
		} else {
			target.attr('type', 'password');
			i.addClass('bi-eye');
			i.removeClass('bi-eye-slash');
		}
	});
});

$('.copytoclip').on('click', (event) => {
	const $target = $('#' + $(event.currentTarget).attr('for'));
	navigator.clipboard.writeText($target.attr('copy'));
	$(event.currentTarget).fadeOut('fast').fadeIn('fast');
});

window.addEventListener('pageshow', function (event) {
	var historyTraversal =
		event.persisted ||
		(typeof window.performance != 'undefined' &&
			window.performance.navigation.type === 2);
	if (historyTraversal) {
		window.location.reload();
	}
});
