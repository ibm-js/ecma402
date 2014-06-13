define(
	[ "./Record", "./calendarFunctions"], function (Record, calendarFunctions) {

		
	return {
		
		SYNODIC_MONTH     : 29.530588853,
		TROPICAL_YEAR     : 365.242191,

		CIVIL_EPOC        : 1948440,
		JD_EPOCH          : 2447891.5,
		EPOCH_JULIAN_DAY  : 2440588,

		SUN_ETA_G         : 279.403303 * Math.PI / 180,
		SUN_OMEGA_G       : 282.768422 * Math.PI / 180,
		SUN_E             : 0.016713,

		DAY_MS            : 24 * 60 * 60 * 1000,
		JULIAN_EPOCH_MS   : -210866760000000,
		HIJRA_MS          : -42521587200000,

		MOON_L0           : 318.351648 * Math.PI / 180,
		MOON_P0           : 36.340410  * Math.PI / 180,
		MOON_N0           : 318.510107 * Math.PI / 180,
		MOON_I            : 5.145366   * Math.PI / 180,

		fromGregorian: function (/*Date*/ gdate) {
			// summary:
			//		This function returns the equivalent Islamic Date value for the Gregorian Date
			var date = new Date(gdate);

			var localMillis = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
			var julianDay = this._floorDivide(localMillis, this.DAY_MS) + this.EPOCH_JULIAN_DAY;

			var days = julianDay - this.CIVIL_EPOC;
			
			// Guess at the number of elapsed full months since the epoch
			var months = Math.floor(days / this.SYNODIC_MONTH);

			var monthStart = Math.floor(months * this.SYNODIC_MONTH - 1);

			if (days - monthStart >= 25 && this._moonAge(date.getTime()) > 0) {
				// If we're near the end of the month, assume next month and search backwards
				months++;
			}

			// Find out the last time that the new moon was actually visible at this longitude
			// This returns midnight the night that the moon was visible at sunset.
			while ((monthStart = this._trueMonthStart(months)) > days) {
				// If it was after the date in question, back up a month and try again
				months--;
			}

			var year = Math.floor(months / 12) + 1;
			var month = months % 12;
			var day = Math.floor(days - this._monthStart(year, month)) + 1;

			this.date = day;
			this.month = month;
			this.year = year;
			this.hours = date.getHours();
			this.minutes = date.getMinutes();
			this.seconds = date.getSeconds();
			this.milliseconds = date.getMilliseconds();
			this.day = date.getDay();
			return this;
		},

		toLocalTime: function (date, timeZone) {
			var islamicDate = this.fromGregorian(date);
			var dt = new Date(date);
			var result = new Record();
			result.set("weekday", timeZone === "UTC" ? dt.getUTCDay() : dt.getDay());
			result.set("era", 0);
			result.set("year", islamicDate.year);
			result.set("month", islamicDate.month);
			result.set("day", islamicDate.date);
			calendarFunctions.setTimeFields(dt, timeZone, result);
			return result;
		},

		_floorDivide: function (numerator, denominator) {
			// summary:
			//		Divide two long integers, returning the floor of the quotient.
			//		Unlike the built-in division, this is mathematically well-behaved.
			//		E.g., -1/4 => 0
			//		but _floorDivide(-1,4) => -1.
			// numerator: Long
			//		The numerator
			// denominator: Long
			//		A divisor which must be > 0
			// returns:
			//		The floor of the quotient.

			// We do this computation in order to handle
			// a numerator of Long.MIN_VALUE correctly
			return Math.floor((numerator >= 0) ? numerator / denominator : ((numerator + 1) / denominator) - 1);
		},

		_monthStart: function (year, month) {
			// summary:
			//		Return the day # on which the given month starts.  Days are counted
			//		From the Hijri epoch, origin 0.
			// year: Integer
			//		The hijri year
			// month: Integer
			//		The hijri month, 0-based

			// Normalize year/month in case month is outside the normal bounds, which may occur
			// in the case of an add operation
			var realYear = year + Math.floor(month / 12);
			var realMonth = month % 12;
			var ms = this._trueMonthStart(12 * (realYear - 1) + realMonth);
			return ms;
		},

		_trueMonthStart: function (month) {
			// summary:
			//		Find the day number on which a particular month of the true/lunar
			//		Islamic calendar starts.
			// month:
			//		The month in question, origin 0 from the Hijri epoch
			// returns:
			//		The day number on which the given month starts.

			// Make a guess at when the month started, using the average length
			var origin = this.HIJRA_MS + Math.floor(month * this.SYNODIC_MONTH) * this.DAY_MS;

			var age = this._moonAge(origin);

			if (this._moonAge(origin) >= 0) {
				// The month has already started
				do {
					origin -= this.DAY_MS;
					age = this._moonAge(origin);
				} while (age >= 0);
			}
			else {
				// Preceding month has not ended yet.
				do {
					origin += this.DAY_MS;
					age = this._moonAge(origin);
				} while (age < 0);
			}

			var start = Math.floor((origin - this.HIJRA_MS) / this.DAY_MS) + 1;
			return start;
		},

		_moonAge: function (time) {
		// summary:
		//		Return the "age" of the moon at the given time; this is the difference
		//		In ecliptic latitude between the moon and the sun.  This method simply
		//		Calls this._getMoonAge, converts to degrees, 
		//		And adjusts the result to be in the range [-180, 180].
		// time: Long
		//		The time at which the moon's age is desired, in millis since 1/1/1970.

			this._time = time;
			var age = this._getMoonAge();
			// Convert to degrees and normalize...
			age = age * 180 / Math.PI;
			if (age > 180) {
				age = age - 360;
			}

			return age;
		},

		_getJulianDay: function () {
		// summary:
		//		Get the current time of this object,
		//		Expressed as a "julian day number", which is the number of elapsed
		//		Days since 1/1/4713 BC (Julian), 12:00 GMT.

			var julianDay = (this._time - this.JULIAN_EPOCH_MS) / this.DAY_MS;
			return julianDay;
		},

		_getSunLongitude: function (julian) {
			// summary:
			//		The longitude of the sun at the time specified by this object.
			//		The longitude is measured in radians along the ecliptic
			//		from the "first point of Aries," the point at which the ecliptic
			//		Crosses the earth's equatorial plane at the vernal equinox.
			//		Currently, this method uses an approximation of the two-body Kepler's
			//		Equation for the earth and the sun.  It does not take into account the
			//		Perturbations caused by the other planets, the moon, etc.
			// julian: Double
			//		The current time expressed as a julian day number
			// returns: Object

			var day = julian - this.JD_EPOCH;       // Days since epoch

			// Find the angular distance the sun in a fictitious
			// circular orbit has travelled since the epoch.
			var epochAngle = this._norm2PI(2 * Math.PI / this.TROPICAL_YEAR * day);

			// The epoch wasn't at the sun's perigee; find the angular distance
			// since perigee, which is called the "mean anomaly"
			var meanAnomaly = this._norm2PI(epochAngle + this.SUN_ETA_G - this.SUN_OMEGA_G);

			// Now find the "true anomaly", e.g. the real solar longitude
			// by solving Kepler's equation for an elliptical orbit
			// NOTE: The 3rd ed. of the book lists omega_g and eta_g in different
			// equations; omega_g is to be correct.
			return {
				sunLongitude : this._norm2PI(this._trueAnomaly(meanAnomaly, this.SUN_E) + this.SUN_OMEGA_G),
				meanAnomalySun: meanAnomaly
			};
		},

		_getMoonAge: function () {
			// summary:
			//		The "age" of the moon at the time specified in this object.
			//		This is really the angle between the
			//		Current ecliptic longitudes of the sun and the moon,
			//		Measured in radians.

			// Calculate the solar longitude.  Has the side effect of
			// filling in "meanAnomalySun" as well.
			var ret = this._getSunLongitude(this._getJulianDay());
			var sunLongitude = ret.sunLongitude;
			var meanAnomalySun = ret.meanAnomalySun;

			//
			// Find the # of days since the epoch of our orbital parameters.
			//
			var day = this._getJulianDay() - this.JD_EPOCH;       // Days since epoch
			
			// Calculate the mean longitude and anomaly of the moon, based on
			// a circular orbit.  Similar to the corresponding solar calculation.
			var meanLongitude = this._norm2PI(13.1763966 * Math.PI / 180 * day + this.MOON_L0);
			var meanAnomalyMoon = this._norm2PI(meanLongitude - 0.1114041 * Math.PI / 180 * day - this.MOON_P0);

			//
			// Calculate the following corrections:
			//  Evection:   the sun's gravity affects the moon's eccentricity
			//  Annual Eqn: variation in the effect due to earth-sun distance
			//  A3:         correction factor (for ???)
			//
			var evection = 1.2739 * Math.PI / 180 * Math.sin(2 * (meanLongitude - sunLongitude) - meanAnomalyMoon);
			var annual   = 0.1858 * Math.PI / 180 * Math.sin(meanAnomalySun);
			var a3       = 0.3700 * Math.PI / 180 * Math.sin(meanAnomalySun);

			meanAnomalyMoon += evection - annual - a3;

			//
			// More correction factors:
			//  center  equation of the center correction
			//  a4      yet another error correction (???)
			//
			var center = 6.2886 * Math.PI / 180 * Math.sin(meanAnomalyMoon);
			var a4     = 0.2140 * Math.PI / 180 * Math.sin(2 * meanAnomalyMoon);

			// Now find the moon's corrected longitude
			var moonLongitude = meanLongitude + evection + center - annual + a4;

			//
			// And finally, find the variation, caused by the fact that the sun's
			// gravitational pull on the moon varies depending on which side of
			// the earth the moon is on
			//
			var variation = 0.6583 * Math.PI / 180 * Math.sin(2 * (moonLongitude - sunLongitude));

			moonLongitude += variation;

			//
			// What we've calculated so far is the moon's longitude in the plane
			// of its own orbit.  Now map to the ecliptic to get the latitude
			// and longitude.  First we need to find the longitude of the ascending
			// node, the position on the ecliptic where it is crossed by the moon's
			// orbit as it crosses from the southern to the northern hemisphere.
			//
			var nodeLongitude = this._norm2PI(this.MOON_N0 - 0.0529539 * Math.PI / 180 * day);

			nodeLongitude -= 0.16 * Math.PI / 180 * Math.sin(meanAnomalySun);

			var y = Math.sin(moonLongitude - nodeLongitude);
			var x = Math.cos(moonLongitude - nodeLongitude);
			
			var moonEclipLong = Math.atan2(y * Math.cos(this.MOON_I), x) + nodeLongitude;

			return this._norm2PI(moonEclipLong - sunLongitude);
		},

		_norm2PI: function (angle) {
			// summary:
			//		Normalize an angle so that it's in the range 0 - 2pi.
			//		For positive angles this is just (angle % 2pi), but the Java
			//		mod operator doesn't work that way for negative numbers....
			// angle: Double
			//		The angle to be normalized in radians
			// returns:
			//		The normalized angle
			return angle - 2 * Math.PI * Math.floor(angle / (2 * Math.PI));
		},

		_trueAnomaly: function (meanAnomaly, eccentricity) {
			// summary:
			//		Find the "true anomaly" (longitude) of an object from
			//		Its mean anomaly and the eccentricity of its orbit.  This uses
			//		An iterative solution to Kepler's equation.
			// meanAnomaly: Double
			//		The object's longitude calculated as if it were in
			//		A regular, circular orbit, measured in radians
			//		From the point of perigee.  
			// eccentricity: Double
			//		The eccentricity of the orbit
			// returns:
			//		The true anomaly (longitude) measured in radians

			// First, solve Kepler's equation iteratively
			// Duffett-Smith, p.90
			var delta;
			var E = meanAnomaly;
			do {
				delta = E - eccentricity * Math.sin(E) - meanAnomaly;
				E = E - delta / (1 - eccentricity * Math.cos(E));
			}
			while (Math.abs(delta) > 1e-5); // epsilon = 1e-5 rad

			return 2.0 * Math.atan(Math.tan(E / 2) * Math.sqrt((1 + eccentricity) / (1 - eccentricity)));
		}
	};
});