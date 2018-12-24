const getSortQuery = require("../sort/getSortQuery");

function filterTests(queryString) {
	if (!queryString) return onEmpty();
	let query = {};

	if (queryString.includes("verified")) {
		query.verified = true;
	}

	if (queryString.includes("-verified")) {
		query.verified = false;
	}

	if (queryString.includes("patched")) {
		query.patch = {
			$ne: null
		};
	}

	if (queryString.includes("-patched")) {
		query.patch = {
			$eq: null
		};
	}

	if (queryString.includes("with_description")) {
		query.description = /.{1,}/;
	}

	if (queryString.includes("liked")) {
		query.likes = {
			$gt: 0
		};
	}

	if (queryString.includes("disliked")) {
		query.dislikes = {
			$gt: 0
		};
	}

	if (queryString.includes("visited")) {
		query.visits = {
			$gt: 0
		};
	}

	if (queryString.includes("replied")) {
		query.numberOfReplied = {
			$gt: 0
		};
	}

	return query;
}

function sortTests(queryString) {
	if (!queryString) return onEmpty();
	const {
		path,
		order
	} = getSortQuery(queryString);
	let sorter = {};
	sorter[path] = order;

	return sorter;
};

function onEmpty() {
	return {};
}

module.exports = {
	filterTests,
	sortTests
};