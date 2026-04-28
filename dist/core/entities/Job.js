export var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus[ApplicationStatus["Interested"] = 0] = "Interested";
    ApplicationStatus[ApplicationStatus["Applied"] = 1] = "Applied";
    ApplicationStatus[ApplicationStatus["Interviewing"] = 2] = "Interviewing";
    ApplicationStatus[ApplicationStatus["Rejected"] = 3] = "Rejected";
})(ApplicationStatus || (ApplicationStatus = {}));
