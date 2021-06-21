tinymce.PluginManager.add(
	"siteorigin-tinymce-google-search",
	function (editor, url) {
		if (tinymce.majorVersion == 4) {
			editor.addButton("siteorigin-tinymce-google-search", {
				text: "SiteOrigin Google Search (Placeholder)",
				onclick: function () {
					editor.windowManager.open({
						title: "SiteOrigin Google Search",
						url: url + "/form.html",
						width: 400,
						height: 300,
					});
				},
			});
		} else {
			editor.ui.registry.addButton("siteorigin-tinymce-google-search", {
				text: "SiteOrigin Google Search (Placeholder)",
				onAction: function () {
					editor.windowManager.openUrl({
						title: "SiteOrigin Google Search",
						url: url + "/form.html",
						width: 400,
						height: 300,
					});
				},
			});
		}
		return {
			getMetadata: function () {
				return {
					name: "SiteOrigin TinyMCE Google Search",
					url: "https://github.com/siteorigin/tinymce-google-search",
				};
			},
		};
	}
);
