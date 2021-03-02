<?php
/*
Plugin Name: SiteOrigin TinyMCE Google Search
Author: SiteOrigin
Author URI: https://siteorigin.com
*/

class SiteOrigin_TinyMCE_Google_Search {

	function __construct() {
		add_filter( 'mce_external_plugins', array( $this, 'load_tinymce_plugin' ) );
		add_filter( 'mce_buttons', array( $this, 'add_button' ) );
	}

	static function single() {
		static $single;
		return empty( $single ) ? $single = new self() : $single;
	}

	function load_tinymce_plugin( $plugins ) {
		$plugins['siteorigin-tinymce-google-search'] = plugin_dir_url( __FILE__ ) . 'plugin.js';
		return $plugins;
	}

	function add_button( $buttons ) {
		$buttons[] = 'siteorigin-tinymce-google-search';
		return $buttons;
	}
}
SiteOrigin_TinyMCE_Google_Search::single();