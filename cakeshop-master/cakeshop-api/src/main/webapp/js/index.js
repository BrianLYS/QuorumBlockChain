import $ from 'jquery'

import 'bootstrap'
import 'd3'
import 'bootstrap-tourist'
// importing here to be used by metrix widgets
import 'epoch-charting-ie-patched'

import moment from 'moment'

import './vendor/stomp.min'
import './vendor/cakeshop'
import utils from './utils'
import './tour'

import 'jif-dashboard/dashboard-core'
import 'jif-dashboard/dashboard-util'
import 'jif-dashboard/dashboard-template'
// import this first because it sets a global all the rest of the widgets need
import './widgets/widget-root'
import NodeChooser from './components/NodeChooser'
import React from 'react'
import ReactDOM from 'react-dom'

// HACK(joel): workaround since some templates require utils and moment globals
window.utils = utils;
window.moment = moment;

window.Tower = {
	client: null,
	ready: false,
	current: null,
	consensus: null,
	status: {
		status: 'init'
	},
	heartbeat: function(response) {
		if (!Tower._set_ver && response.meta && response.meta['cakeshop-version']) {
			Tower._set_ver = true;

			$('aside nav').append('<div class="version-info">Cakeshop ' + response.meta["cakeshop-version"] + '</div>');

			var build = response.meta['cakeshop-build-id'];
			if (build && build.length > 0) {
				$('aside nav').append('<div class="version-info" title="' + build + ' built on ' + response.meta['cakeshop-build-date'] + '">Build ' + build.substring(0, 8) + '</div>');
			}
		}

		var status = response.data.attributes;

		// Set the client once status is retrieved
		if (Tower.client === null) {
			Tower.client = 'geth';
			// Redraw the current section
			$('#' + Dashboard.section).click();
		}

		//set consensus type
		Tower.consensus = status.consensus

		if (status.status === 'running') {
			$('#default-node-status').html( $('<span>', { html: 'Running' }) );

			$('#default-node-status').parent().find('.fa')
			 .removeClass('fa-pause tower-txt-danger')
			 .addClass('fa-play tower-txt-success');
		} else {
			$('#default-node-status').html( $('<span>', { html: utils.capitalize(status.status) }) );

			$('#default-node-status').parent().find('.fa')
			 .removeClass('fa-play tower-txt-success')
			 .addClass('fa-pause tower-txt-danger');
		}

        utils.prettyUpdate(Tower.status.peerCount, utils.getPeerNumberText(status), $('#default-peers'));
		utils.prettyUpdate(Tower.status.latestBlock, status.latestBlock, $('#default-blocks'));
		utils.prettyUpdate(Tower.status.pendingTxn, status.pendingTxn, $('#default-txn'));

		if (status.status !== Tower.status.status) {
			$(document).trigger('CakeshopEvent', ['node|status-flip|' + JSON.stringify({
				from: Tower.status.status,
				to: status.status
			}) ]);
		}

		Tower.status = status;

		// Tower Control becomes ready only after the first status is received from the server
		if (!Tower.ready) {
			Tower.isReady();
		}

        Tower.initUrlDropdown();
		Dashboard.Utils.emit('node-status|announce');
	},

	// Tower Control becomes ready only after the first status is received from the server
	isReady: function() {
		Tower.ready = true;

		// let everyone listening in know
		Dashboard.Utils.emit('tower-control|ready|true');

		if (window.localStorage.getItem('tour_end') === null) {
			//first time, activate tour automatically
			$(document).trigger('StartTour');
			Tower.tour.start();
		}

		return true;
	},

    initUrlDropdown: function () {
        ReactDOM.render(<NodeChooser />,
            document.getElementById('rpc-select-container')
        );
    },

	init: function() {
		Dashboard.setOptions({
			'minWidth': 250,
			'minHeight': 250
		});

		// Shared widgets
		Dashboard.preregisterWidgets({
			'accounts'               : require('./widgets/accounts'),
			'block-detail'           : require('./widgets/block-detail'),
			'block-list'             : require('./widgets/block-list'),
			'block-view'             : require('./widgets/block-view'),
			'clique-signers'		 : require('./widgets/clique-signers'),
			'contract-current-state' : require('./widgets/contract-current-state'),
			'contract-detail'        : require('./widgets/contract-detail'),
            'contract-transact'      : require('./widgets/contract-transact'),
			'contract-list'          : require('./widgets/contract-list'),
			'contract-paper-tape'    : require('./widgets/contract-paper-tape'),
			// 'doc-frame'              : require('./widgets/doc-frame'),
			'fund-accounts'			 : require('./widgets/fund-accounts'),
			'metrix-blocks-min'      : require('./widgets/metrix-blocks-min'),
			'metrix-txn-min'         : require('./widgets/metrix-txn-min'),
			// 'metrix-txn-sec'         : require('./widgets/metrix-txn-sec'),
			'permissions-list'       : require('./widgets/permission-list'),
			'permissions-detail'       : require('./widgets/permission-detail'),
			'node-info'              : require('./widgets/node-info'),
			'peers-add'              : require('./widgets/peers-add'),
			'peers-list'             : require('./widgets/peers-list'),
			'istanbul-validators'             : require('./widgets/istanbul-validators'),
			'txn-detail'             : require('./widgets/txn-detail'),
		});

		Dashboard.init();

		// Adding event for hash changes
		$(window).on('hashchange', this.processHash);


		// event handler registration for clipboard fuckery
		$('#_clipboard_button').on('click', utils.copyToClipboard);

		this.processHash();

		// Reusing socket from cakeshop.js
		Tower.stomp = Client.stomp;
		Tower.stomp_subscriptions = Client._stomp_subscriptions;


		// Manual status retrieve during init
		$.when(
			utils.load({ url: 'api/node/get' })
		).done(function(response) {
			Tower.heartbeat(response);
		}).fail(function() {
			// Handler for when its dead
			Tower.heartbeat({
				data: {
					attributes: {
						status: 'DOWN',
						peerCount: 'n/a',
						latestBlock: 'n/a',
						pendingTxn: 'n/a'
					}
				}
			});
		});

		// Socket subscription for status updates
		Client.on('stomp:connect', function() {
			Tower.subscription = utils.subscribe('/topic/node/status', Tower.heartbeat);
		});

		// Show disconnect notice when stomp looses connection
		Client.on('stomp:disconnect', function() {
			Tower.heartbeat({
				data: {
					attributes: {
						status: 'DOWN',
						peerCount: 'n/a',
						latestBlock: 'n/a',
						pendingTxn: 'n/a'
					}
				}
			});

			Tower.subscription.unsubscribe();
		});


		// Handle session info
		Tower.session();

		// Retry session when status changes
		$(document).on('CakeshopEvent', function(ev, action) {
			if (action.indexOf('node|status-flip') >= 0) {
				Tower.session();
			}
		});
	},

	session: function() {
		if (Tower.hasOwnProperty('securityEnabled') && Tower.securityEnabled === false) {
			return;
		}

		// Fetch session info
		$.ajax({
			type: 'GET',
			url: 'user',
			contentType: 'application/json',
			cache: false,
			async: true
		}).then(function(res) {
			if (Tower.hasOwnProperty('session_interval')) {
				window.clearInterval(Tower.session_interval);
			}

			// security is enabled
			if (res.securityEnabled === true) {
				Tower.securityEnabled = true;

				// security is on and session expired, reload
				if (res.hasOwnProperty('loggedout')) {
					window.location.reload(true);
				}

				// defaulting to java's default session expiration
				Tower.session_interval = window.setInterval(Tower.session, 1000 * 60 * 30);
			} else {
				Tower.securityEnabled = false;
			}
		});
	},

	processHash: function() {
		// http://localhost:8080/index.html#section=explorer&widgetId=txn-detail&data=0xd6398cb5cb5bac9d191de62665c1e7e4ef8cd9fe1e9ff94eec181a7b4046345c
		// http://localhost:8080/index.html#section=explorer&widgetId=block-detail&data=2
		if (window.location.hash) {
			const params = {};
			const hash = window.location.hash.substring(1, window.location.hash.length);

			_.each(hash.split('&'), function(pair) {
				pair = pair.split('=');
				params[pair[0]] = decodeURIComponent(pair[1]);
			});

			var werk = function() {
				if (params.section) {
					$('#' + params.section).click();
				}

				if (params.data) {
					try {
						params.data = JSON.parse(params.data);
					} catch (err) {}
				}

				if (params.widgetId) {
					Dashboard.show({
						widgetId: params.widgetId,
						section: params.section ? params.section : Tower.current,
						data: params.data, refetch: true,
					});
				}
			};

			// do when ready
			if (!Tower.ready) {
				Dashboard.Utils.on(function(ev, action) {
					if (action.indexOf('tower-control|ready|') === 0) {
						werk();
					}
				});
			} else {
				werk();
			}
		}
	},

	section: {
		'console': function() {
			var widgets = [
				{ widgetId: 'node-info' },
				// { widgetId: 'metrix-txn-sec' },
				{ widgetId: 'metrix-txn-min' },
				{ widgetId: 'metrix-blocks-min' },
			];

			Dashboard.showSection('console', widgets);
		},

		'peers': function() {
			var widgets = [
				{ widgetId: 'peers-list' },
                { widgetId: 'peers-add' }
			];

			if (Tower.consensus === 'istanbul') {
				widgets.push({ widgetId: 'istanbul-validators' });
			} else if (Tower.consensus === 'clique') {
				widgets.push({ widgetId: 'clique-signers' });
			}

			Dashboard.showSection('peers', widgets);
		},

		// 'api': function() {
		// 	var widgets = [
		// 		{ widgetId: 'doc-frame' }
		// 	];
        //
		// 	Dashboard.showSection('api', widgets);
		// },

		'contracts': function() {
			var widgets = [
				{ widgetId: 'contract-list' }
			];

			Dashboard.showSection('contracts', widgets);
		},

		'explorer': function() {
			var widgets = [
				{ widgetId: 'block-detail', data: Tower.status.latestBlock },
				{ widgetId: 'block-list', data: Tower.status.latestBlock },
				{ widgetId: 'block-view' }
			];

			Dashboard.showSection('explorer', widgets);
		},

		'permissioning': function() {
			var widgets = [
				{ widgetId: 'permissions-list' }
			];

			Dashboard.showSection('permissioning', widgets);
		},

		'wallet': function() {
			var widgets = [
				{ widgetId: 'accounts' },
				{ widgetId: 'fund-accounts'}
			];

			Dashboard.showSection('wallet', widgets);
		},
	},

	debug: function(message) {
		var _ref;
		return typeof window !== 'undefined' && window !== null ? (_ref = window.console) !== null ? _ref.log(message) : void 0 : void 0;
	},

};

$(function() {
	$(window).on('scroll', function(e) {
		if ($(window).scrollTop() > 50) {
			$('body').addClass('sticky');
		} else {
			$('body').removeClass('sticky');
		}
	});

	// logo handler
	$('a.tower-logo').click(function(e) {
		e.preventDefault();
		$('#console').click();
	});

	// Menu (burger) handler
	$('.tower-toggle-btn').on('click', function() {
		$('.tower-logo-container').toggleClass('tower-nav-min');
		$('.tower-sidebar').toggleClass('tower-nav-min');
		$('.tower-body-wrapper').toggleClass('tower-nav-min');
	});

	$('#reset').on('click', function() {
		Dashboard.reset(true);
	});

	$('#reset-all').on('click', function() {
        Dashboard.reset();
	});

    // Update current reporting URL
    Client.get('api/node/reportingUrl')
        .done(function (response) {
            window.reportingEndpoint = response.data.attributes.result;
        })

	// Navigation menu handler
	$('.tower-sidebar li').click(function(e) {
		var id = $(this).attr('id');
		if (id === 'sandbox') {
			return;
		} else if (id === 'help') {
			$(document).trigger('StartTour');
			Tower.tour.restart();

			return;
		}

		e.preventDefault();

		Tower.current = id;

		$('.tower-sidebar li').removeClass('active');
		$(this).addClass('active');

		Tower.section[Tower.current]();

		$('.tower-page-title').html( $('<span>', { html: $(this).find('.tower-sidebar-item').html() }) );
	});


	// ---------- INIT -----------
	Tower.init();


	// add dispatcher listener
	// $(document).on('WidgetInternalEvent', function(ev, action) {
	//	 Tower.debug(ev, action);
	// });

	// Setting 'Console' as first section
	$('.tower-sidebar li').first().click();
});
