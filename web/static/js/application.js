/* POST/GET API Requests */
function POST_Request_API(post_data){
  return $.ajax({ type: "POST", url: "/api", data: post_data, async: false}).responseText
}

function GET_Request_API(url_or_path){
  return $.ajax({ type: "GET", url: url_or_path, async: false}).responseText
}

/* Reports */
function editReport(){
  var report_name = $("#inlineFormCustomSelect").val();
  if(report_name != "Choose..."){
    $("#reportTitle").val("");
    $("#reportBody").val(JSON.parse(POST_Request_API("view_template=true&report_name=" + report_name))['content']);
    $('#reportGeneratorModal').show();
    $('body').addClass('modal-open');
    $("#reportGeneratorModal").modal("show");
  }
}

/* Reports */
$('.view-or-edit-report').click(function() {
  $('.view-or-edit-report').not(this).removeClass('active');
  $(this).addClass('active');
});

$('#editMarkdownButton').click(function() {
  $("#previewReport").hide();
  $("#reportBody").show();
});

$('#previewMarkdownButton').click(function() {
  $("#reportBody").hide();
  $("#previewReport").html(converter.makeHtml(he.encode($("#reportBody").val())));
  $("#previewReport").show();
});

function createDownload(text, name, type) {
  if(name != ".md"){
    var dlbtn = document.getElementById("dlbtn");
    var file = new Blob([text], {type: type});
    dlbtn.href = URL.createObjectURL(file);
    dlbtn.download = name;
  } else {
    alert('File Cannot be Left Blank!');
  }
}

/* Notes */
$('.view-or-edit-note').click(function() {
  $('.view-or-edit-note').not(this).removeClass('active');
  $(this).addClass('active');
});

function createNewNote(noteName){
  POST_Request_API({"newNote":noteName});
  window.location.hash = "#notes";
  location.reload();
}

function viewNote(noteName){
  $('#noteName').html(he.encode(JSON.parse(POST_Request_API('note='+noteName))['file_name']));
  $('#viewNote').html(converter.makeHtml(JSON.parse(POST_Request_API({'note':noteName}))['content']));
  $('#viewModal').show();
}

function saveNote(noteName, noteBody){
    POST_Request_API("saveNote="+noteName+"&noteBody="+noteBody)
    window.location.hash = "#notes";
    location.reload();
}

function deleteNote(noteName){
  POST_Request_API({"deleteNote" : noteName});
  window.location.hash = "#notes";
  location.reload();
}

function editNote(noteName){
  $('.editor-modal-title').html('Editing: ' + JSON.parse(POST_Request_API({'note':noteName}))['file_name']);
  $('.editor-modal-body').val(he.decode(JSON.parse(POST_Request_API({'note':noteName}))['content']));
  $('#editorModal').show();
}

$('#editNoteMarkdownButton').click(function() {
  $("#previewNote").hide();
  $("#noteBody").show();
});

$('#previewNoteMarkdownButton').click(function() {
  $("#noteBody").hide();
  $("#previewNote").html(converter.makeHtml(he.encode($("#noteBody").val())));
  $("#previewNote").show();
});

/* Aquatone */
// Aquatone-Discover Scan
function aquatoneDiscover(target){
  POST_Request_API({"aquatone-discover":target});
}

// Aquatone-Takeover Scan
function aquatoneTakeover(target){
  POST_Request_API({"aquatone-takeover":target});
}

// Check Aquatone Progress
function aquatoneProgressCheck(){
  progress_check = POST_Request_API({"aquatone-progress":"view"}).trim();
  console.log("Still Scanning for Subdomains...")
  console.log(progress_check)
  if(progress_check == '"false"') {
    $('#aquatoneProgressModal').fadeOut(500,function() {
      $(this).modal('hide');
      clearInterval(interval);
    });
    $('.modal-backdrop').hide();
  }
}

/* Nmap */
// Find Nmap Scan type
function getScanType(){
  if($("#TCPConnectScan").hasClass('active')){
    return("TCPConnectScan");
  } else if($("#SYNStealthScan").hasClass('active')){
    return("SYNStealthScan");
  } else if($("#VersionDetctionScan").hasClass('active')){
    return("VersionDetctionScan");
  } else if($("#PingScan").hasClass('active')){
    return("PingScan");
  } else {
    return("SSLScan")
  }
}

// Nmap Scan
function nmapScan(target_object){
  POST_Request_API("target_name=" + $("#nmap_target_name").val().trim() + "&target_json=" + target_object.trim() + "&scan_type="+ getScanType());
}

// Check Nmap Scan Progress
function nmapProgressCheck(){
  progress_check = POST_Request_API({"nmap_progress":"view"}).trim();
  console.log(progress_check);
  console.log("Still Scanning for Ports...");
  if(progress_check == '"false"') {
    $('#nmapProgressModal').fadeOut(500,function() {
      $(this).modal('hide');
      clearInterval(interval2);
    });
    $('.modal-backdrop').hide();
  }
}

$("#TCPConnectScan").click(function(){
  $(this).addClass('active');
  $("#SYNStealthScan").removeClass("active");
  $("#VersionDetctionScan").removeClass("active");
  $("#PingScan").removeClass("active");
});

$("#SYNStealthScan").click(function(){
  $(this).addClass('active');
  $("#TCPConnectScan").removeClass("active");
  $("#VersionDetctionScan").removeClass("active");
  $("#PingScan").removeClass("active");
});

$("#VersionDetctionScan").click(function(){
  $(this).addClass('active');
  $("#TCPConnectScan").removeClass("active");
  $("#SYNStealthScan").removeClass("active");
  $("#PingScan").removeClass("active");
});

$("#PingScan").click(function(){
  $(this).addClass('active');
  $("#TCPConnectScan").removeClass("active");
  $("#SYNStealthScan").removeClass("active");
  $("#VersionDetctionScan").removeClass("active");
});

/* SSL Scan */
// Check SSL Scan Progress
function sslscanProgressCheck(){
  progress_check = POST_Request_API({"sslscan_progress":"view"}).trim();
  console.log(progress_check);
  console.log("Still Scanning SSL...");
  if(progress_check == '"false"') {
    $('#sslProgressModal').fadeOut(500,function() {
      $(this).modal('hide');
      clearInterval(interval3);
    });
    $('.modal-backdrop').hide();
  }
}

// SSL Scan
function sslScan(target_object){
  $("#PingScan").removeClass("active");
  $("#TCPConnectScan").removeClass("active");
  $("#SYNStealthScan").removeClass("active");
  $("#VersionDetctionScan").removeClass("active");
  POST_Request_API("target_name=" + $("#ssl_target_name").val().trim() + "&target_json=" + target_object.trim() + "&scan_type="+ getScanType());
}

// View Scan Result
function scanResults(scan_type, folder, file_name){
    $(".scan-results-modal-title").html(escape(file_name));
    $("#scan-result-content").html(he.encode(JSON.parse(POST_Request_API("scan_results=" + scan_type + "&folder=" + folder + "&file_name=" + file_name))["contents"]));
    $("#scanResults").modal('show');
}

// Navigation
function hideAllForms(){
  $("#dashboard").hide(); // Hide Dashboard
  $("#requesteditor").hide(); // Hide Request Editor
  $("#notes").hide(); // Hide Notes form
  $("#aquatone").hide(); // Hide Aquatone Form
  $("#aquatoneProgressModal").hide(); // Hide Aquatone Loading Modal
  $("#aquatone-filetree").hide(); // Hide Aquatone File Tree
  $("#nmap-filetree").hide(); // Hide Nmap File Tree
  $("#ssl-filetree").hide(); // Hide SSL Scan File Tree
  $("#nmap").hide(); // Hide Nmap Form
  $("#previous-scans").hide(); // Hide Previous Scans
  $("#sslscan").hide(); // Hide Heartbleed Module
  $("#import-report-template").hide(); // Hide Report Template Importer
  $("#generate-report").hide(); // Hide Report Generator
  $("#nav-item-0").removeClass("active"); // Dashboard
  $("#nav-item-1").removeClass("active"); // Request Editor
  $("#nav-item-2").removeClass("active"); // Notes
  $("#nav-item-3").removeClass("active"); // Previous Scans
  $("#nav-item-4").removeClass("active"); // aquatone
  $("#nav-item-5").removeClass("active"); // Nmap
  $("#nav-item-6").removeClass("active"); // Heartbleed
  $("#nav-item-7").removeClass("active"); // Import Report Template
  $("#nav-item-8").removeClass("active"); // Generate Report
  $("#collapseMulti").removeClass("active"); // Collapse Nav 1
  $("#collapseMulti2").removeClass("active"); // Collapse Nav 2
}

// On Hash Change
$(window).on('hashchange',function(){
  if(location.hash == "#dashboard" || location.hash == ""){
    hideAllForms();
    $("#dashboard").show();
    $("#nav-item-0").addClass("active");
    $("#breadcrum-name").html("Dashboard");
  }

  if(location.hash == "#requestedit"){
    hideAllForms();
    $("#requesteditor").show();
    $("#nav-item-1").addClass("active");
    $("#breadcrum-name").html("Request Editor");
  }

  if(location.hash == "#notes"){
    hideAllForms();
    $("#notes").show();
    $("#nav-item-2").addClass("active");
    $("#breadcrum-name").html("Notes");
  }

  if(location.hash == "#previous-scans"){
    hideAllForms();
    $("#previous-scans").show();
    $("#nav-item-3").addClass("active");
    $("#breadcrum-name").html("My Scans");
  }

  if(location.hash == "#aquatone"){
    hideAllForms();
    $("#aquatone").show();
    $("#nav-item-4").addClass("active");
    $("#breadcrum-name").html("Aquatone Flyover");
    $("#collapseMulti").addClass("show");
  }

  if(location.hash == "#nmap"){
    hideAllForms();
    $("#nmap").show();
    $("#nav-item-5").addClass("active");
    $("#breadcrum-name").html("Nmap Port Scanner");
    $("#collapseMulti").addClass("show");
  }

  if(location.hash == "#aquatone-scans"){
    hideAllForms();
    $("#previous-scans").show();
    $("#nav-item-3").addClass("active");
    $("#breadcrum-name").html("Aquatone Scans");
    $("#aquatone-filetree").show();
  }

  if(location.hash == "#nmap-scans"){
    hideAllForms();
    $("#previous-scans").show();
    $("#nav-item-3").addClass("active");
    $("#breadcrum-name").html("Nmap Scans");
    $("#nmap-filetree").show();
  }

  if(location.hash == "#ssl-scans"){
    hideAllForms();
    $("#previous-scans").show();
    $("#nav-item-3").addClass("active");
    $("#breadcrum-name").html("SSL Scans");
    $("#ssl-filetree").show();
  }

  if(location.hash == "#sslscan"){
    hideAllForms();
    $("#sslscan").show();
    $("#nav-item-6").addClass("active");
    $("#breadcrum-name").html("Tests for POODLE (CVE-2014-3566) and Heartbleed (CVE-2014-0160)");
    $("#collapseMulti").addClass("show");
  }

  if(location.hash == "#import-report-template"){
    hideAllForms();
    $("#import-report-template").show();
    $("#nav-item-7").addClass("active");
    $("#breadcrum-name").html("Import Report Template");
    $("#collapseMulti").addClass("show");
    $("#collapseMulti2").addClass("show");
  }

  if(location.hash == "#generate-report"){
    hideAllForms();
    $("#generate-report").show();
    $("#nav-item-8").addClass("active");
    $("#breadcrum-name").html("Edit & Generate a Report");
    $("#collapseMulti").addClass("show");
    $("#collapseMulti2").addClass("show");
    $("#reportTitle").val("");
    $("#inlineFormCustomSelect").val("Choose...");
  }
});

// Main Navigation
if(location.hash == "#dashboard" || location.hash == ""){
  hideAllForms();
  $("#dashboard").show();
  $("#nav-item-0").addClass("active");
  $("#breadcrum-name").html("Dashboard");
}

if(location.hash == "#generate-report"){
  hideAllForms();
  $("#generate-report").show();
  $("#nav-item-8").addClass("active");
  $("#breadcrum-name").html("Edit & Generate a Report");
  $("#collapseMulti").addClass("show");
  $("#collapseMulti2").addClass("show");
  $("#reportTitle").val("");
  $("#inlineFormCustomSelect").val("Choose...");
}

if(location.hash == "#requestedit"){
  hideAllForms();
  $("#requesteditor").show();
  $("#nav-item-1").addClass("active");
  $("#breadcrum-name").html("Request Editor");
}

if(location.hash == "#notes"){
  hideAllForms();
  $("#notes").show();
  $("#nav-item-2").addClass("active");
  $("#breadcrum-name").html("Notes");
}

if(location.hash == "#previous-scans"){
  hideAllForms();
  $("#previous-scans").show();
  $("#nav-item-3").addClass("active");
  $("#breadcrum-name").html("Old Requests");
}

if(location.hash == "#aquatone"){
  hideAllForms();
  $("#aquatone").show();
  $("#nav-item-4").addClass("active");
  $("#breadcrum-name").html("Aquatone Flyover");
  $("#collapseMulti").addClass("show");
}

if(location.hash == "#nmap"){
  hideAllForms();
  $("#nmap").show();
  $("#nav-item-5").addClass("active");
  $("#breadcrum-name").html("Nmap Port Scanner");
  $("#collapseMulti").addClass("show");
}

if(location.hash == "#aquatone-scans"){
  hideAllForms();
  $("#previous-scans").show();
  $("#nav-item-3").addClass("active");
  $("#breadcrum-name").html("Aquatone Scans");
  $("#collapseMulti").addClass("show");
  $("#collapseMulti2").addClass("show");
  $("#aquatone-filetree").show();
}

if(location.hash == "#nmap-scans"){
  hideAllForms();
  $("#previous-scans").show();
  $("#nav-item-3").addClass("active");
  $("#breadcrum-name").html("Nmap Scans");
  $("#collapseMulti").addClass("show");
  $("#collapseMulti2").addClass("show");
  $("#nmap-filetree").show();
}

if(location.hash == "#ssl-scans"){
  hideAllForms();
  $("#previous-scans").show();
  $("#nav-item-3").addClass("active");
  $("#breadcrum-name").html("SSL Scans");
  $("#ssl-filetree").show();
}

if(location.hash == "#sslscan"){
  hideAllForms();
  $("#sslscan").show();
  $("#nav-item-6").addClass("active");
  $("#breadcrum-name").html("Tests for POODLE (CVE-2014-3566) and Heartbleed (CVE-2014-0160)");
  $("#collapseMulti").addClass("show");
}

if(location.hash == "#import-report-template"){
  hideAllForms();
  $("#import-report-template").show();
  $("#nav-item-7").addClass("active");
  $("#breadcrum-name").html("Import Report Template");
  $("#collapseMulti").addClass("show");
  $("#collapseMulti2").addClass("show");
}

if(location.hash == "#generate-report"){
  hideAllForms();
  $("#generate-report").show();
  $("#nav-item-8").addClass("active");
  $("#breadcrum-name").html("Edit & Generate a Report");
  $("#collapseMulti").addClass("show");
  $("#collapseMulti2").addClass("show");
}
