define( [], function (List) {

	// Implementation of the List abstract data type from ECMA 402.
	List = function () {
		for (var i = 0; i < arguments.length; i++) {
			this[i] = arguments[i];
		}
		this.length = arguments.length;
	};

	List.prototype.push = function (item) {
		this[this.length] = item;
		this.length++;
	};

	List.prototype.toArray = function () {
		var i = 0;
		var result = new Array(this.length);
		while (i < this.length) {
			result[i] = this[i];
			i++;
		}
		return result;
	};

	return List;
});