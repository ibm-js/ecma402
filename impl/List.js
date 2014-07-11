define(function () {

	/**
	 * Simple implementation of the List abstract data type from ECMA 402.
	 * 
	 * @constructor
	 * @private
	 */
	var List = function () {
		this.length = 0;
	};

	List.prototype.forEach = function (f) {
		for (var i = 0; i < this.length; i++) {
			f(this[i]);
		}
	};
	
	List.prototype.push = function (item) {
		this[this.length] = item;
		this.length++;
	};

	List.prototype.indexOf = function (item) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] === item) {
				return i;
			}
		}
		return -1;
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