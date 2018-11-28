var stats = {
    type: "GROUP",
name: "Global Information",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "Global Information",
    "numberOfRequests": {
        "total": "120000",
        "ok": "119999",
        "ko": "1"
    },
    "minResponseTime": {
        "total": "3",
        "ok": "3",
        "ko": "4"
    },
    "maxResponseTime": {
        "total": "466",
        "ok": "466",
        "ko": "4"
    },
    "meanResponseTime": {
        "total": "49",
        "ok": "49",
        "ko": "4"
    },
    "standardDeviation": {
        "total": "32",
        "ok": "32",
        "ko": "0"
    },
    "percentiles1": {
        "total": "43",
        "ok": "43",
        "ko": "4"
    },
    "percentiles2": {
        "total": "58",
        "ok": "58",
        "ko": "4"
    },
    "percentiles3": {
        "total": "117",
        "ok": "117",
        "ko": "4"
    },
    "percentiles4": {
        "total": "157",
        "ok": "157",
        "ko": "4"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 119999,
        "percentage": 100
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 0,
        "percentage": 0
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 0,
        "percentage": 0
    },
    "group4": {
        "name": "failed",
        "count": 1,
        "percentage": 0
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "677.966",
        "ok": "677.96",
        "ko": "0.006"
    }
},
contents: {
"req_document-create-fd6ab": {
        type: "REQUEST",
        name: "document:create",
path: "document:create",
pathFormatted: "req_document-create-fd6ab",
stats: {
    "name": "document:create",
    "numberOfRequests": {
        "total": "120000",
        "ok": "119999",
        "ko": "1"
    },
    "minResponseTime": {
        "total": "3",
        "ok": "3",
        "ko": "4"
    },
    "maxResponseTime": {
        "total": "466",
        "ok": "466",
        "ko": "4"
    },
    "meanResponseTime": {
        "total": "49",
        "ok": "49",
        "ko": "4"
    },
    "standardDeviation": {
        "total": "32",
        "ok": "32",
        "ko": "0"
    },
    "percentiles1": {
        "total": "43",
        "ok": "43",
        "ko": "4"
    },
    "percentiles2": {
        "total": "58",
        "ok": "58",
        "ko": "4"
    },
    "percentiles3": {
        "total": "117",
        "ok": "117",
        "ko": "4"
    },
    "percentiles4": {
        "total": "157",
        "ok": "157",
        "ko": "4"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 119999,
        "percentage": 100
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 0,
        "percentage": 0
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 0,
        "percentage": 0
    },
    "group4": {
        "name": "failed",
        "count": 1,
        "percentage": 0
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "677.966",
        "ok": "677.96",
        "ko": "0.006"
    }
}
    }
}

}

function fillStats(stat){
    $("#numberOfRequests").append(stat.numberOfRequests.total);
    $("#numberOfRequestsOK").append(stat.numberOfRequests.ok);
    $("#numberOfRequestsKO").append(stat.numberOfRequests.ko);

    $("#minResponseTime").append(stat.minResponseTime.total);
    $("#minResponseTimeOK").append(stat.minResponseTime.ok);
    $("#minResponseTimeKO").append(stat.minResponseTime.ko);

    $("#maxResponseTime").append(stat.maxResponseTime.total);
    $("#maxResponseTimeOK").append(stat.maxResponseTime.ok);
    $("#maxResponseTimeKO").append(stat.maxResponseTime.ko);

    $("#meanResponseTime").append(stat.meanResponseTime.total);
    $("#meanResponseTimeOK").append(stat.meanResponseTime.ok);
    $("#meanResponseTimeKO").append(stat.meanResponseTime.ko);

    $("#standardDeviation").append(stat.standardDeviation.total);
    $("#standardDeviationOK").append(stat.standardDeviation.ok);
    $("#standardDeviationKO").append(stat.standardDeviation.ko);

    $("#percentiles1").append(stat.percentiles1.total);
    $("#percentiles1OK").append(stat.percentiles1.ok);
    $("#percentiles1KO").append(stat.percentiles1.ko);

    $("#percentiles2").append(stat.percentiles2.total);
    $("#percentiles2OK").append(stat.percentiles2.ok);
    $("#percentiles2KO").append(stat.percentiles2.ko);

    $("#percentiles3").append(stat.percentiles3.total);
    $("#percentiles3OK").append(stat.percentiles3.ok);
    $("#percentiles3KO").append(stat.percentiles3.ko);

    $("#percentiles4").append(stat.percentiles4.total);
    $("#percentiles4OK").append(stat.percentiles4.ok);
    $("#percentiles4KO").append(stat.percentiles4.ko);

    $("#meanNumberOfRequestsPerSecond").append(stat.meanNumberOfRequestsPerSecond.total);
    $("#meanNumberOfRequestsPerSecondOK").append(stat.meanNumberOfRequestsPerSecond.ok);
    $("#meanNumberOfRequestsPerSecondKO").append(stat.meanNumberOfRequestsPerSecond.ko);
}
