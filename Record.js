define(function () {

	// Implementation of the Record abstract data type from ECMA 402.
	var Record = function () {
		this.length = 0;
	};

	Record.prototype.set = function (field, val) {
		Object.defineProperty(this, field, {
			value : val,
			writable : true,
			enumerable : true,
			configurable : true
		});
	};
	return Record;
});