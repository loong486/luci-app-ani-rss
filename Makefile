include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-ani-rss
PKG_VERSION:=1.0.0
PKG_RELEASE:=1
PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=ImmortalWrt / OpenWrt Community

LUCI_TITLE:=LuCI support for ANI-RSS (Auto Anime RSS Tracking & Scraper)
LUCI_DEPENDS:=+luci-base +curl +ca-bundle +tar +coreutils
LUCI_PKGARCH:=all

define Package/luci-app-ani-rss/conffiles
/etc/config/ani-rss
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
