chrome.storage.local.get(
	{ userAgent: "Mediapartners-Google" },
	({ userAgent }) => (document.querySelector(".userAgent").value = userAgent)
);

document.querySelector(".save").addEventListener("click", () => {
	chrome.storage.local.set({
		userAgent: document.querySelector(".userAgent").value,
	});
});
