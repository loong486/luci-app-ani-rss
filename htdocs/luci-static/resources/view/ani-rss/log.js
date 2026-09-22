'use strict';
'require view';
'require fs';
'require ui';
'require rpc';
'require poll';

var callGetLog = rpc.declare({
	object: 'luci.ani-rss',
	method: 'get_log',
	params: [ 'lines' ],
	expect: { 'log': [] }
});

var callClearLog = rpc.declare({
	object: 'luci.ani-rss',
	method: 'clear_log',
	expect: {}
});

return view.extend({
	load: function() {
		return callGetLog(100);
	},

	render: function(initialLog) {
		var m = document.createElement('div');
		m.className = 'cbi-map';

		var title = document.createElement('h2');
		title.textContent = _('ANI-RSS 运行日志');
		m.appendChild(title);

		var desc = document.createElement('div');
		desc.className = 'cbi-map-descr';
		desc.textContent = _('实时展示 ANI-RSS 守护进程与 Spring Boot 后台输出日志（来自 /var/log/ani-rss.log）。');
		m.appendChild(desc);

		var sec = document.createElement('div');
		sec.className = 'cbi-section';

		// Controls
		var ctrlRow = document.createElement('div');
		ctrlRow.style.marginBottom = '12px';
		ctrlRow.style.display = 'flex';
		ctrlRow.style.alignItems = 'center';
		ctrlRow.style.gap = '15px';

		var clearBtn = document.createElement('button');
		clearBtn.className = 'btn cbi-button-reset';
		clearBtn.textContent = _('清空日志');
		clearBtn.onclick = function() {
			callClearLog().then(function() {
				var textarea = document.getElementById('ani_rss_log_view');
				if (textarea) textarea.value = '';
				ui.addNotification(null, E('p', _('日志已清空。')), 'info');
			});
		};
		ctrlRow.appendChild(clearBtn);

		var autoScrollLabel = document.createElement('label');
		autoScrollLabel.style.display = 'inline-flex';
		autoScrollLabel.style.alignItems = 'center';
		autoScrollLabel.style.cursor = 'pointer';
		var autoScrollCheck = document.createElement('input');
		autoScrollCheck.type = 'checkbox';
		autoScrollCheck.id = 'ani_rss_auto_scroll';
		autoScrollCheck.checked = true;
		autoScrollLabel.appendChild(autoScrollCheck);
		autoScrollLabel.appendChild(document.createTextNode(' ' + _('自动滚动到底部')));
		ctrlRow.appendChild(autoScrollLabel);

		var linesSelect = document.createElement('select');
		linesSelect.id = 'ani_rss_lines_select';
		linesSelect.className = 'cbi-input-select';
		[50, 100, 200, 500].forEach(function(n) {
			var opt = document.createElement('option');
			opt.value = n;
			opt.text = n + ' ' + _('行');
			if (n === 100) opt.selected = true;
			linesSelect.appendChild(opt);
		});
		ctrlRow.appendChild(linesSelect);

		sec.appendChild(ctrlRow);

		// Log textarea
		var logTextarea = document.createElement('textarea');
		logTextarea.id = 'ani_rss_log_view';
		logTextarea.className = 'cbi-input-textarea';
		logTextarea.style.width = '100%';
		logTextarea.style.height = '480px';
		logTextarea.style.fontFamily = 'monospace, "Courier New", Courier';
		logTextarea.style.fontSize = '12px';
		logTextarea.style.lineHeight = '1.4';
		logTextarea.style.backgroundColor = '#1e1e1e';
		logTextarea.style.color = '#d4d4d4';
		logTextarea.style.padding = '10px';
		logTextarea.style.borderRadius = '4px';
		logTextarea.readOnly = true;

		if (initialLog && Array.isArray(initialLog.log)) {
			logTextarea.value = initialLog.log.join('\n');
		} else {
			logTextarea.value = _('暂无日志记录');
		}

		sec.appendChild(logTextarea);
		m.appendChild(sec);

		poll.add(function() {
			var sel = document.getElementById('ani_rss_lines_select');
			var numLines = sel ? parseInt(sel.value, 10) : 100;

			return callGetLog(numLines).then(function(res) {
				var view = document.getElementById('ani_rss_log_view');
				var auto = document.getElementById('ani_rss_auto_scroll');
				if (view && res && Array.isArray(res.log)) {
					view.value = res.log.join('\n');
					if (auto && auto.checked) {
						view.scrollTop = view.scrollHeight;
					}
				}
			});
		}, 3);

		return m;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
