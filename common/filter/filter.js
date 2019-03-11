const {
	result
} = require("lodash");

module.exports = class {
	constructor(data, query) {
		this.data = data;
		this.query = query;
	}

	static filter(data, query) {
		return new this(data, query);
	}

	result() {
		return this.data;
	}

	filterField(field, tag, validator) {
		if (this.query.includes(tag)) {
			this.data = this.data.filter(f => result(f, field) === (validator || true));
			return this;
		}

		return this;
	}
};