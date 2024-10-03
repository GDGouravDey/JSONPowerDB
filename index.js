const jpdbBaseURL = "http://api.login2explore.com:5577";
const jpdbIRL = "/api/irl";
const jpdbIML = "/api/iml";
const DBName = "PROJECT-TABLE";
const relationName = "COLLEGE-DB";
const connectionToken = "90934522|-31949226165491634|90962933";

$("#proID").focus();

function saveRecNoToLocalStorage(jsonObj) {
    const localData = JSON.parse(jsonObj.data);
    localStorage.setItem("recno", localData.rec_no);
}

function getProjectIdAsJsonObj() {
    const proID = $("#proID").val();
    return JSON.stringify({ id: proID });
}

function fillData(jsonObj) {
    saveRecNoToLocalStorage(jsonObj);
    const record = JSON.parse(jsonObj.data).record;
    $("#proname").val(record.name);
    $("#proemp").val(record.proemp);
    $("#prodate").val(record.prodate);
    $("#deadline").val(record.deadline);
}

function resetForm() {
    $("#proID").val("");
    $("#proname").val("");
    $("#proemp").val("");
    $("#prodate").val("");
    $("#deadline").val("");
    $("#proID").prop("disabled", false);
    $("#proID").focus();
    alert("Form has been reset. You can enter a new Project ID.");
}

function validateData() {
    const proID = $("#proID").val();
    const proname = $("#proname").val();
    const proemp = $("#proemp").val();
    const prodate = $("#prodate").val();
    const deadline = $("#deadline").val();
    
    if (!proID) {
        alert("Please enter the Project ID.");
        $("#proID").focus();
        return "";
    }
    if (!proname) {
        alert("Please enter the Project Name.");
        $("#proname").focus();
        return "";
    }
    if (!proemp) {
        alert("Please enter the name of the person assigned.");
        $("#proemp").focus();
        return "";
    }
    if (!prodate) {
        alert("Please enter the Assignment Date.");
        $("#prodate").focus();
        return "";
    }
    if (!deadline) {
        alert("Please enter the Project Deadline.");
        $("#deadline").focus();
        return "";
    }
    
    return JSON.stringify({ id: proID, name: proname, proemp, prodate, deadline });
}

function getProject() {
    const proIDJsonObj = getProjectIdAsJsonObj();
    const getRequest = createGET_BY_KEYRequest(connectionToken, DBName, relationName, proIDJsonObj);
    
    jQuery.ajaxSetup({ async: false });
    const resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });

    if (resJsonObj.status === 400) {
        $("#save, #reset").prop("disabled", false);
        $("#proname").focus();
    } else if (resJsonObj.status === 200) {
        $("#proID").prop("disabled", true);
        fillData(resJsonObj);
        $("#change, #reset").prop("disabled", false);
        $("#proname").focus();
    }
}

function checkRecordExists(proID) {
    const proIDJsonObj = JSON.stringify({ id: proID });
    const getRequest = createGET_BY_KEYRequest(connectionToken, DBName, relationName, proIDJsonObj);
    
    jQuery.ajaxSetup({ async: false });
    const resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });

    return resJsonObj.status === 200;
}

function saveData() {
    const jsonStrObj = validateData();
    if (jsonStrObj === "") return;

    const proID = JSON.parse(jsonStrObj).id; 

    if (checkRecordExists(proID)) {
        alert("Record with this Project ID already exists. Please use a different ID.");
        $("#proID").focus(); 
        return; 
    }

    const putRequest = createPUTRequest(connectionToken, jsonStrObj, DBName, relationName);
    jQuery.ajaxSetup({ async: false });
    const resJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });

    if (resJsonObj.status === 200) {
        const localData = JSON.parse(resJsonObj.data);
        localStorage.setItem("recno", localData.rec_no);
        alert("Project data saved successfully!");
    } else {
        alert("Error saving data: " + resJsonObj.message);
    }
}


function changeData() {
    $("#change").prop("disabled", true);

    const jsonChg = validateData();
    if (jsonChg === "") return; 

    const proID = JSON.parse(jsonChg).id; 

    if (!checkRecordExists(proID)) {
        alert("Record with this Project ID does not exist. Please check and try again.");
        $("#proID").focus();
        $("#change").prop("disabled", false); 
        return;
    }

    const updateRequest = createUPDATERecordRequest(
        connectionToken,
        jsonChg,
        DBName,
        relationName,
        localStorage.getItem("recno") 
    );

    jQuery.ajaxSetup({ async: false });
    const resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });

    if (resJsonObj.status === 200) {
        alert("Project data updated successfully!");
    } else {
        alert("Error updating data: " + resJsonObj.message); 
    }

    $("#proID").focus(); 
    $("#change").prop("disabled", false); 
}
