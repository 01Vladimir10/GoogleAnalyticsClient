const ControlIds = {
    GetReportButton: "GetReportButton",
    ReportContainer: "ReportContainer",
    StartDate: "StartDate",
    EndDate: "EndDate",
    ChartCanvas: "AnalyticsReportsChart",
    ReportTableContainer: "ReportTableContainer",
    ChartControls: "AnalyticsReportChartControls",
    TableContainer: "AnalyticsReportTableContainer",
    DateRange: "AnalyticsReportsDateRangePicker",
    DowloadReportButton: "AnalyticsReportDownload",
}
const CssClasses = {
    ChartControlItem : "chart-control-item",
    ChartControlItemSelected : "selected"
}
const Query = {
    startDate: new Date(),
    endDate: new Date(),
}
let DataChart;
let DataSetLabels = [];

//#region ApiMethods
function buildHttpQuery(params) {
    let query = "";
    for (let p in params) {
        if (params.hasOwnProperty(p)) {
            query += encodeURIComponent(p) + "=" + encodeURIComponent(params[p]) + "&";
        }
    }
    return query;
}
async function fetchReport() {
    let request =
        {
            propertyId: "291688969",
            startDate: Query.startDate.toISOString(),
            endDate: Query.endDate.toISOString(),
        };
    let data = await getReport(request);
    fillTable(data['htmlTable']);
    return buildReportModel(data.data);
}
// Update the table
function fillTable(htmlTable) {
    document.getElementById(ControlIds.TableContainer)
        .innerHTML = htmlTable;
}

async function getReport(params) {
    let url = "/Analytics/GenerateAnalyticsReport?" + buildHttpQuery(params);
    let report = await fetch(url, {
        method: "GET",
    });
    return await report.json();
}
function buildReportModel(report) {
    let datasets = {};
    const data = report['Data'];
    const dates = data['Date'].map(d => new Date(d).toISOString());

    // Init datasets empty
    for (let i = 0; i < report['ColumnHeaders'].length; i++) {
        let header = report['ColumnHeaders'][i];
        datasets[header['Name']] = {
            name: header['Name'],
            displayName: header['DisplayName'],
            data: []
        }
    }
    // Map the datasets.
    let columnKeys = Object.keys(data);

    for (let i = 0; i < dates.length; i++) {
        for (let key of columnKeys) {
            datasets[key].data.push({
                x: dates[i],
                y: data[key][i],
            });
        }
    }
    return {
        labels: dates,
        datasets: datasets
    };
}
//#endregion
//#region Chart Methods
function setUpChart() {
    // initialize the chart empty
    DataChart = new Chart(document.getElementById(ControlIds.ChartCanvas), {
        type: 'line',
        options: {
            snapGaps: true,
            legend: {
                display: false
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd, yy'
                        }
                    },
                    ticks: {
                        source: 'labels',
                        maxTicksLimit: 8,
                        // Prevent the labels on the x axis from rotating
                        maxRotation: 0,
                        minRotation: 0
                    }
                },
            }
        },
    });
}
function updateChartModel(dataSet) {
    if (DataChart == null)
        setUpChart();
    DataChart.data = {
        labels: DataSetLabels,
        datasets: [
            {
                label: dataSet.displayName,
                data: dataSet.data,
                backgroundColor: 'rgb(0,81,253)',
                borderColor: 'rgb(0,81,253)',
            },
        ]
    };
    DataChart.update();
}

//#endregion
//#region Chart Control Methods
function initializeChartControls(datasets) {
    let controls = document.getElementById(ControlIds.ChartControls);
    controls.innerHTML = '';
    for (let set of Object.values(datasets)) {
        if (set.name === 'Date')
            continue;

        let sum = set.data.reduce((a, b) => a + b.y, 0).toFixedDown(2);
        let element = document.createElement('li');
        element.classList.add('report-chart-control');
        element.setAttribute('data-dataset-name', set.name);
        element.innerHTML = `
            <div class="report-chart-control__bar"></div>
            <div class="report-chart-control__title">
                ${set.displayName}
            </div>
            <div class="report-chart-control__summary">
                ${sum}
            </div>
        `;
        controls.append(element);
    }
    attachControlListeners(datasets);
}
function attachControlListeners(dataSets) {
    let controlsContainer = document.getElementById(ControlIds.ChartControls);
    controlsContainer.querySelectorAll('.report-chart-control').forEach(control => {
        control.addEventListener('click', function () {
            let datasetName = this.getAttribute('data-dataset-name');
            controlsContainer.querySelector('.report-chart-control.selected')?.classList.remove('selected');
            this.classList.add('selected');
            updateChartModel(dataSets[datasetName]);
        });
    });
}
function setSelectedChartControl(datasetName) {
    document.querySelector(`#${ControlIds.ChartControls} [data-dataset-name="${datasetName}"]`)
        .classList.add('selected');
}
//#endregion

function setDefaultValues() {
    let today = new Date();
    Query.startDate = new Date();
    Query.startDate.setDate(today.getDate() - 30);
    Query.endDate = new Date();
}

function setUpDateRange() {
    new DateRangePicker(document.getElementById(ControlIds.DateRange), {
        defaultStartDate: Query.startDate,
        defaultEndDate: Query.endDate,
        defaultLabel: "Ultimos 30 dias",
        onDateChange: async (start, end) => {
            Query.startDate = start;
            Query.endDate = end;
            let data = await fetchReport();
            updateChart(data);
        }
    })
    
}

function updateChart(data) {

    DataSetLabels = data.labels;
    initializeChartControls(data.datasets);

    // Fill the chart with data.
    updateChartModel(data.datasets['NewUsers']);
    setSelectedChartControl('NewUsers');
}

function setUpDownloadButton() {
    document.getElementById(ControlIds.DowloadReportButton)
        .addEventListener('click', async () => {
            let name = `Analytics_Report_${Query.startDate.toISOString()}-${Query.endDate.toISOString()}`;
            await exportTableToExcel(ControlIds.TableContainer, name);
        });
    
}

async function onStart() {
    setDefaultValues();
    let data = await fetchReport();
    setUpChart();
    updateChart(data);
    setUpDateRange();
    setUpDownloadButton();
}


window.addEventListener('load', async function () {
    await onStart();
});



//#region Helpers
Number.prototype.toFixedDown = function(digits) {
    let re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};

function exportTableToExcel(tableID, filename = ''){
    let downloadLink = document.createElement("a");
    let dataType = 'application/vnd.ms-excel';
    let tableSelect = document.getElementById(tableID);
    let tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

    // Specify file name
    filename = filename?filename+'.xls':'excel_data.xls';

    // Create download link element
    document.body.appendChild(downloadLink);

    if(navigator.msSaveOrOpenBlob){
        let blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        // Setting the file name
        downloadLink.download = filename;
        //triggering the function
        downloadLink.click();
    }
}
//#endregion