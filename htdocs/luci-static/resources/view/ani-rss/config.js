'use strict';
'require view';
'require form';

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('ani-rss', _('ANI-RSS 追番助手设置'),
			_('在这里配置 ANI-RSS 原生运行参数、文件存储目录及 JVM 内存调优选项。'));

		s = m.section(form.NamedSection, 'main', 'ani-rss', _('服务配置'));
		s.addremove = false;

		s.tab('basic', _('基础设置'));
		s.tab('advanced', _('高级与性能设置'));

		// --- Basic Tab ---
		o = s.taboption('basic', form.Flag, 'enabled', _('启用服务'),
			_('开启或关闭 ANI-RSS 追番守护进程'));
		o.rmempty = false;

		o = s.taboption('basic', form.Value, 'port', _('Web 监听端口'),
			_('默认端口为 7789，修改后需通过新端口访问 Web 管理页面'));
		o.datatype = 'port';
		o.default = '7789';
		o.rmempty = false;

		o = s.taboption('basic', form.Value, 'bind_addr', _('绑定地址'),
			_('监听的 IP 地址，0.0.0.0 表示允许局域网与所有接口访问'));
		o.datatype = 'ip4addr';
		o.default = '0.0.0.0';
		o.rmempty = false;

		o = s.taboption('basic', form.Value, 'config_dir', _('数据与配置目录'),
			_('用于存放 ANI-RSS 的 SQLite 数据库、订阅规则与运行配置。若插入了 USB 移动硬盘或 NVMe，强烈建议设置为外置存储路径（如 <code>/mnt/sda1/ani-rss</code>）以保护路由器闪存寿命。'));
		o.default = '/etc/ani-rss';
		o.rmempty = false;

		o = s.taboption('basic', form.Value, 'download_dir', _('追番下载存储目录'),
			_('与 qBittorrent、Transmission 等下载器配合使用的动漫落地目录（如 <code>/mnt/sda1/anime</code>）。'));
		o.default = '/mnt/sda1/anime';
		o.rmempty = false;

		// --- Advanced Tab ---
		o = s.taboption('advanced', form.Value, 'java_path', _('自定义 Java 路径'),
			_('可指定特定 Java 二进制文件路径。留空则自动按顺序检索配置目录自带 JRE、<code>/opt/ani-rss/jre</code> 以及系统 PATH 中的 java。'));
		o.placeholder = _('留空自动探测');
		o.rmempty = true;

		o = s.taboption('advanced', form.Value, 'jar_path', _('自定义 ani-rss.jar 路径'),
			_('可指定主程序 JAR 路径。留空则默认读取数据目录下的 <code>ani-rss.jar</code>。'));
		o.placeholder = _('留空自动读取数据目录');
		o.rmempty = true;

		o = s.taboption('advanced', form.Value, 'heap_min', _('JVM 初始堆内存 (-Xms)'),
			_('启动时申请的最小内存，建议 32M 或 64M。'));
		o.default = '32M';
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'heap_max', _('JVM 最大堆内存 (-Xmx)'),
			_('限制 JVM 可占用的最大堆内存，防止低内存路由器发生 OOM 崩溃。1GB 内存路由器建议设置为 256M，2GB 内存路由器可设置为 512M。'));
		o.default = '256M';
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'jvm_options', _('额外 JVM 参数'),
			_('传递给 JVM 的调优参数，默认采用 G1GC 垃圾回收器并限制线程栈大小以减小内存占用。'));
		o.default = '-XX:+UseG1GC -Xss256k';
		o.rmempty = true;

		o = s.taboption('advanced', form.ListValue, 'mirror_source', _('下载与更新镜像加速源'),
			_('一键在线下载/更新核心 JAR 和 JRE 运行时所使用的代理加速节点'));
		o.value('ghfast', 'ghfast.top (' + _('推荐国内加速') + ')');
		o.value('ghproxy', 'mirror.ghproxy.com (' + _('备用代理镜像') + ')');
		o.value('official', 'GitHub Official (' + _('官方直连') + ')');
		o.value('custom', _('自定义加速前缀'));
		o.default = 'ghfast';

		o = s.taboption('advanced', form.Value, 'custom_mirror', _('自定义加速前缀'),
			_('形如 https://ghproxy.net 或自建代理地址'));
		o.depends('mirror_source', 'custom');
		o.rmempty = true;

		return m.render();
	}
});
