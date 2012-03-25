/**
 * @author saterond
 */
var application = new GTDApplication();

var ApplicationTestSuite = {
    suiteName: "Application Test Suite",
    
    setUp: function() {
    },
 
    tearDown: function() {
    },
    
    testGetSQLDateToday: function() {
    	var datum = new Date();
		
		var month_really = datum.getMonth() + 1;
		var month = (month_really < 10) ? "0"+month_really : month_really;
		var day_really = datum.getDate();
		var day = (day_really < 10) ? "0"+day_really : day_really;
		var today = datum.getFullYear() + "-" + month + "-" + day;
		
		var sqlToday = application.getSQLDate();
		
		jsUnity.assertions.assertEqual(today, sqlToday, "Dates don't match");
    },
    
    testGetSQLDateWeekBefore: function() {
    	var datum = new Date();
    	datum.setDate(datum.getDate() - 7);
		
		var month_really = datum.getMonth() + 1;
		var month = (month_really < 10) ? "0"+month_really : month_really;
		var day_really = datum.getDate();
		var day = (day_really < 10) ? "0"+day_really : day_really;
		var week = datum.getFullYear() + "-" + month + "-" + day;
		
		var sqlWeek = application.getSQLDate(7);
		
		jsUnity.assertions.assertEqual(week, sqlWeek, "Dates don't match");
    },
    
    testGetSQLDateMonthBefore: function() {
    	var datum = new Date();
    	datum.setDate(datum.getDate() - 30);
		
		var month_really = datum.getMonth() + 1;
		var month = (month_really < 10) ? "0"+month_really : month_really;
		var day_really = datum.getDate();
		var day = (day_really < 10) ? "0"+day_really : day_really;
		var monthDate = datum.getFullYear() + "-" + month + "-" + day;
		
		var sqlMonth = application.getSQLDate(30);
		
		jsUnity.assertions.assertEqual(monthDate, sqlMonth, "Dates don't match");
    }
}