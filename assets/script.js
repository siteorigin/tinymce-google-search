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

// Add translatable text to the form.
document.getElementsByClassName(
	"text"
)[0].childNodes[0].textContent = top.tinymce.activeEditor.translate("text");
linkContainer.childNodes[0].textContent = top.tinymce.activeEditor.translate(
	"link"
);
linkField.placeholder = top.tinymce.activeEditor.translate(
	"Paste a link, or search"
);

textField.value = top.tinymce.activeEditor.selection.getContent({
	format: "text",
});

// Hide text field on load if text is already selected.
if (textField.value) {
	document.getElementsByClassName("text")[0].style.display = "none";
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

linkField.addEventListener("keyup", function () {
	searchButton.disabled = !textField.value || !linkField.value;
	linkSearchResults.textContent = "";
	searchNotice.textContent = "";

	clearTimeout(searchDelayTimer);

	if (!linkField.value) {
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
		linkSearchResults.textContent = "";
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
