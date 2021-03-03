var searchForm = document.getElementsByClassName("search-form")[0],
	searchButton = document.getElementsByClassName("search-button")[0],
	textField = document.getElementsByClassName("text-field")[0],
	linkContainer = document.getElementsByClassName("link")[0],
	linkSearchContainer = document.getElementsByClassName("search-container")[0],
	linkField = document.getElementsByClassName("link-field")[0],
	searchNotice = document.getElementsByClassName("search-notice")[0],
	spinner = document.getElementsByClassName("spinner")[0],
	linkSearchResults = document.getElementsByClassName("search-results")[0],
	searchDelayTimer = null;

if (!top.tinymce.activeEditor.getParam("google_api")) {
	document.body.innerHTML =
		top.tinymce.activeEditor.translate("No Google API Key Detected.") +
		' <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener noreferrer">' +
		top.tinymce.activeEditor.translate("Read More") +
		"</a>.";
}

if (!top.tinymce.activeEditor.getParam("google_cx")) {
	document.body.innerHTML =
		top.tinymce.activeEditor.translate(
			"Unable to detect Google Search engine ID."
		) +
		' <a href="https://support.google.com/programmable-search/answer/2649143" target="_blank" rel="noopener noreferrer">' +
		top.tinymce.activeEditor.translate("Read More") +
		"</a>.";
}

// Add translatable text to the form.
document.getElementsByClassName(
	"text"
)[0].childNodes[0].textContent = top.tinymce.activeEditor.translate("Text");
linkContainer.childNodes[0].textContent = top.tinymce.activeEditor.translate(
	"Link"
);
linkField.placeholder = top.tinymce.activeEditor.translate(
	"Paste a link, or search"
);

// Pre-fill fields.
// In the event the user is trying to edit an existing link, we need to detect the selected content slightly differently.
if (top.tinymce.activeEditor.selection.getNode().nodeName == "A") {
	let selectedNode = top.tinymce.activeEditor.selection.getNode();
	textField.value = selectedNode.textContent;
	linkField.value = selectedNode.href;
	searchButton.disabled = false;
} else {
	textField.value = top.tinymce.activeEditor.selection.getContent({
		format: "text",
	});
}

textField.addEventListener("change", function () {
	searchButton.disabled = !textField.value || !linkField.value;
});

linkField.addEventListener("focus", function () {
	linkSearchContainer.style.display = "block";
	document.addEventListener("click", hideSearchResultsList);
});

var doSearch = function () {
	fetch(
		"https://www.googleapis.com/customsearch/v1?key=" +
			top.tinymce.activeEditor.getParam("google_api") +
			"&cx=" +
			top.tinymce.activeEditor.getParam("google_cx") +
			"&q=" +
			linkField.value
	)
		.then((response) => response.json())
		.then(function (data) {
			if (typeof data.error == "object") {
				searchNotice.textContent =
					top.tinymce.activeEditor.translate("Error: ") +
					data.error.code +
					" " +
					data.error.message;
				return;
			}

			// Check if there are results.
			if (!data.items) {
				searchNotice.textContent = top.tinymce.activeEditor.translate(
					"No valid search results found"
				);
				return;
			}

			data.items.forEach(function (item) {
				let newListItem = document.createElement("li");
				newListItem.setAttribute("tabindex", "0");

				// Title.
				let itemTitle = document.createElement("span");
				itemTitle.classList.add("item-text");
				itemTitle.textContent = item.title;
				newListItem.appendChild(itemTitle);

				// URL.
				let itemUrl = document.createElement("span");
				itemUrl.classList.add("item-url");
				itemUrl.textContent = item.formattedUrl;
				newListItem.appendChild(itemUrl);

				// External Open.
				let itemExternal = document.createElement("a");
				itemExternal.classList.add("open-external");
				itemExternal.setAttribute("href", item.link);
				itemExternal.setAttribute("target", "_blank");
				itemExternal.setAttribute("rel", "noopener noreferrer");
				itemExternal.textContent = "Open"; // Placeholder.
				newListItem.appendChild(itemExternal);

				// Store the link for the click handler.
				newListItem.link = item.link;

				linkSearchResults.appendChild(newListItem);
			});
		})
		.catch(function (err) {
			searchNotice.textContent =
				top.tinymce.activeEditor.translate("Error: ") + err;
		});

	spinner.style.display = "none";
};

linkField.addEventListener("keyup", function (e) {
	// Don't allow tab to trigger this.
	if (e.keyCode == 9) {
		return;
	}
	searchButton.disabled = !textField.value || !linkField.value;
	linkSearchResults.textContent = "";
	searchNotice.textContent = "";

	clearTimeout(searchDelayTimer);

	// If the field is empty, or if value starts with http, don't proceed.
	if (!linkField.value || linkField.value.startsWith("http:")) {
		return;
	}

	spinner.style.display = "block";
	searchDelayTimer = setTimeout(doSearch, 1500);
});

linkSearchResults.addEventListener("click", function (e) {
	if (e.target.className != "open-external") {
		linkField.value = e.target.parentElement.link;
		hideSearchResultsList();
		e.preventDefault();
	}
});

// Keyboard Accessibility for link search results list.
linkSearchResults.addEventListener("keydown", function (e) {
	if (e.keyCode == 38 && e.target.previousSibling != null) {
		// Up pressed.
		e.target.previousSibling.focus();
		e.preventDefault();
	} else if (e.keyCode == 40) {
		// Down pressed.
		e.preventDefault();
		if (e.target.nextSibling == null) {
			// Last item, close list and focus button.
			hideSearchResultsList();
			searchButton.focus();
		} else {
			e.target.nextSibling.focus();
		}
	} else if (
		e.keyCode == 9 &&
		e.target.nodeName != "A" &&
		e.target.nextSibling == null
	) {
		// Tab pressed, and .open-external doesn't have focus.
		// Last item, close list and focus button.
		e.preventDefault();
		hideSearchResultsList();
		searchButton.focus();
	}
});

// Handle passing data back to TinyMCE.
searchForm.addEventListener("submit", function (e) {
	e.preventDefault();

	textField.value = top.tinymce.activeEditor.selection.setContent(
		`<a href="${linkField.value}">${textField.value}</a>`
	);
	top.tinymce.activeEditor.windowManager.close();
});

// Handle Search Results Visibility.
var hideSearchResultsList = function (e = false) {
	if (!e || !linkContainer.contains(e.target)) {
		linkSearchContainer.style.display = "none";
		document.removeEventListener("click", hideSearchResultsList);
	}
};
