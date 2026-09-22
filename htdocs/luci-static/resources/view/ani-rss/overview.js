'use strict';
'require view';
'require fs';
'require ui';
'require rpc';
'require poll';

var callStatus = rpc.declare({
	object: 'luci.ani-rss',
	method: 'status',
	expect: {}
});

var callDownloadJar = rpc.declare({
	object: 'luci.ani-rss',
	method: 'download_jar',
	expect: {}
});

var callDownloadJre = rpc.declare({
	object: 'luci.ani-rss',
	method: 'download_jre',
	expect: {}
});

return view.extend({
	load: function() {
		return callStatus();
	},

	render: function(status) {
		var m = document.createElement('div');
		m.className = 'cbi-map';

		var title = document.createElement('h2');
		title.textContent = _('ANI-RSS 追番助手');
		m.appendChild(title);

		var desc = document.createElement('div');
		desc.className = 'cbi-map-descr';
		desc.textContent = _('基于 RSS 自动追番、订阅、下载、刮削与洗版工具，OpenWrt 原生轻量化运行。');
		m.appendChild(desc);

		// Status Section
		var sec = document.createElement('div');
		sec.className = 'cbi-section';

		var statusCard = document.createElement('div');
		statusCard.className = 'cbi-value';

		var statusLabel = document.createElement('label');
		statusLabel.className = 'cbi-value-title';
		statusLabel.textContent = _('当前运行状态');
		statusCard.appendChild(statusLabel);

		var statusField = document.createElement('div');
		statusField.className = 'cbi-value-field';
		statusField.id = 'ani_rss_status_badge';
		statusCard.appendChild(statusField);
		sec.appendChild(statusCard);

		// Web UI Jump Button
		var webCard = document.createElement('div');
		webCard.className = 'cbi-value';
		var webLabel = document.createElement('label');
		webLabel.className = 'cbi-value-title';
		webLabel.textContent = _('ANI-RSS Web 控制台');
		webCard.appendChild(webLabel);

		var webField = document.createElement('div');
		webField.className = 'cbi-value-field';
		var openBtn = document.createElement('a');
		openBtn.className = 'btn cbi-button-action';
		openBtn.id = 'ani_rss_web_btn';
		openBtn.target = '_blank';
		openBtn.textContent = _('打开 Web 管理界面');
		openBtn.style.marginRight = '10px';
		webField.appendChild(openBtn);
		webCard.appendChild(webField);
		sec.appendChild(webCard);

		// Info Table
		var table = document.createElement('table');
		table.className = 'table';
		table.innerHTML = 
			'<thead><tr>' +
			'<th width="25%">' + _('项目') + '</th>' +
			'<th width="75%">' + _('详细信息') + '</th>' +
			'</tr></thead>' +
			'<tbody id="ani_rss_info_table"></tbody>';
		sec.appendChild(table);

		// Quick Action Buttons
		var actionCard = document.createElement('div');
		actionCard.className = 'cbi-value';
		var actionLabel = document.createElement('label');
		actionLabel.className = 'cbi-value-title';
		actionLabel.textContent = _('快捷操作');
		actionCard.appendChild(actionLabel);

		var actionField = document.createElement('div');
		actionField.className = 'cbi-value-field';

		var restartBtn = document.createElement('button');
		restartBtn.className = 'btn cbi-button-apply';
		restartBtn.textContent = _('重启服务');
		restartBtn.style.marginRight = '10px';
		restartBtn.onclick = function() {
			ui.showModal(_('正在重启服务...'), [
				E('p', { 'class': 'spinning' }, _('正在执行重启操作，请稍候...'))
			]);
			fs.exec('/etc/init.d/ani-rss', ['restart']).then(function() {
				ui.hideModal();
				ui.addNotification(null, E('p', _('ANI-RSS 服务重启指令已发送。')), 'info');
			});
		};
		actionField.appendChild(restartBtn);

		var dlJarBtn = document.createElement('button');
		dlJarBtn.className = 'btn cbi-button-neutral';
		dlJarBtn.textContent = _('一键下载 / 更新 ani-rss.jar');
		dlJarBtn.style.marginRight = '10px';
		dlJarBtn.onclick = function() {
			ui.showModal(_('正在下载核心程序...'), [
				E('p', { 'class': 'spinning' }, _('正在从镜像源拉取 ani-rss.jar (约 71MB)，请保持网络通畅，稍候约 1~3 分钟...'))
			]);
			callDownloadJar().then(function(res) {
				ui.hideModal();
				if (res && res.success) {
					ui.addNotification(null, E('p', _('ani-rss.jar 下载成功！路径: ') + (res.path || '')), 'info');
				} else {
					ui.addNotification(null, E('p', _('下载失败: ') + (res && res.message ? res.message : _('未知错误'))), 'danger');
				}
			}).catch(function(err) {
				ui.hideModal();
				ui.addNotification(null, E('p', _('下载请求超时或异常: ') + err), 'danger');
			});
		};
		actionField.appendChild(dlJarBtn);

		var dlJreBtn = document.createElement('button');
		dlJreBtn.className = 'btn cbi-button-neutral';
		dlJreBtn.textContent = _('一键安装轻量 musl JRE');
		dlJreBtn.onclick = function() {
			ui.showModal(_('正在部署 musl JRE...'), [
				E('p', { 'class': 'spinning' }, _('正在下载针对当前 CPU 架构的 OpenWrt/musl JRE 运行时并自动解压，稍候约 1~3 分钟...'))
			]);
			callDownloadJre().then(function(res) {
				ui.hideModal();
				if (res && res.success) {
					ui.addNotification(null, E('p', _('musl JRE 安装部署成功！')), 'info');
				} else {
					ui.addNotification(null, E('p', _('JRE 部署失败: ') + (res && res.message ? res.message : _('未知错误'))), 'danger');
				}
			}).catch(function(err) {
				ui.hideModal();
				ui.addNotification(null, E('p', _('部署请求超时或异常: ') + err), 'danger');
			});
		};
		actionField.appendChild(dlJreBtn);

		actionCard.appendChild(actionField);
		sec.appendChild(actionCard);

		m.appendChild(sec);

		function updateUI(data) {
			var badge = document.getElementById('ani_rss_status_badge');
			var btn = document.getElementById('ani_rss_web_btn');
			var tbody = document.getElementById('ani_rss_info_table');

			if (!badge || !tbody) return;

			var host = window.location.hostname;
			var port = data.port || 7789;
			btn.href = 'http://' + host + ':' + port;

			if (data.running) {
				badge.innerHTML = '<span class="label success" style="font-size:110%; padding:4px 8px;">' + _('RUNNING 运行中') + '</span>';
				btn.removeAttribute('disabled');
				btn.classList.remove('disabled');
			} else {
				if (!data.jar_exists || !data.java_bin) {
					badge.innerHTML = '<span class="label warning" style="font-size:110%; padding:4px 8px;">' + _('NOT READY 环境未就绪') + '</span>';
				} else {
					badge.innerHTML = '<span class="label danger" style="font-size:110%; padding:4px 8px;">' + _('STOPPED 已停止') + '</span>';
				}
				btn.setAttribute('disabled', 'disabled');
				btn.classList.add('disabled');
			}

			var memMb = data.memory_kb ? (data.memory_kb / 1024).toFixed(1) : '0';
			var rows = [
				[_('监听端口'), port],
				[_('进程 PID'), data.running ? data.pid : '-'],
				[_('内存占用 (RSS)'), data.running ? (memMb + ' MB') : '-'],
				[_('CPU 硬件架构'), data.arch || 'unknown'],
				[_('Java 运行环境'), data.java_bin ? ('<span style="color:#28a745;">' + data.java_bin + '</span> (' + (data.java_version || _('已就绪')) + ')') : '<span style="color:#dc3545; font-weight:bold;">' + _('未找到 Java 环境，请点击下方「一键安装轻量 musl JRE」') + '</span>'],
				[_('核心程序 (ani-rss.jar)'), data.jar_exists ? ('<span style="color:#28a745;">' + data.jar_path + '</span> (' + data.jar_size_mb + ' MB)') : '<span style="color:#dc3545; font-weight:bold;">' + _('未检测到核心程序，请点击下方「一键下载 / 更新」') + '</span>'],
				[_('数据存储目录'), data.config_dir + ' (' + _('可用空间: ') + (data.disk_free_mb || 0) + ' MB)']
			];

			var html = '';
			for (var i = 0; i < rows.length; i++) {
				html += '<tr><td><strong>' + rows[i][0] + '</strong></td><td>' + rows[i][1] + '</td></tr>';
			}
			tbody.innerHTML = html;
		}

		updateUI(status || {});

		poll.add(function() {
			return callStatus().then(function(res) {
				updateUI(res || {});
			});
		}, 3);

		return m;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
