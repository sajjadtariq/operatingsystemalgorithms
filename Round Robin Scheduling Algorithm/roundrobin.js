
let processCount = 0; // Start with the first process
let processes = [];

function addProcess() {
    let arrivalTime = document.getElementById(`at${processCount}`).value;
    let executionTime = document.getElementById(`et${processCount}`).value;

    if (arrivalTime === '' || executionTime === '') {
        alert('Please fill both fields for the current process.');
        return;
    }

    processes.push({
        pid: processCount, // processCount starts at 1, so subtract 1 for zero-based index
        at: parseInt(arrivalTime),
        et: parseInt(executionTime),
        et_remaining: parseInt(executionTime),
        ct: 0, wt: 0, tat: 0, rt: 0, start_time: 0, utilization: 0
    });

    processCount++;

    let processInputs = document.getElementById('processInputs');
    processInputs.innerHTML =
        `
                <div class="inputfield my-3">
                    <label>Process ${processCount} Arrival Time: </label>
                    <input type="number" id="at${processCount}" required>
                </div>
                <div class="inputfield my-3">
                    <label>Process ${processCount} Execution Time: </label>
                    <input type="number" id="et${processCount}" required>
                </div>
            `;
}

const addbtn = document.getElementById('add');
addbtn.addEventListener('click', addProcess)

function runRoundRobin() {
    console.log("Starting Round Robin Scheduling...");

    let arrivalTime = document.getElementById(`at${processCount}`).value;
    let executionTime = document.getElementById(`et${processCount}`).value;

    if (arrivalTime !== '' && executionTime !== '') {
        processes.push({
            pid: processCount,
            at: parseInt(arrivalTime),
            et: parseInt(executionTime),
            et_remaining: parseInt(executionTime),
            ct: 0, wt: 0, tat: 0, rt: 0, start_time: 0, utilization: 0
        });

        processCount++;
    }

    let tq = parseInt(document.getElementById('timeQuantum').value);

    processes.sort((a, b) => a.at - b.at);

    let currentTime = 0, completed = 0, queue = [], visited = new Array(processCount).fill(false);
    let sumTAT = 0, sumWT = 0, sumRT = 0, sumUtil = 0;

    queue.push(0);
    visited[0] = true;
    console.log(`Ready Queue at time ${currentTime}: ${queue.join(', ')}`);

    while (completed != processCount) {
        let index = queue.shift();

        if (processes[index].et_remaining === processes[index].et) {
            processes[index].start_time = Math.max(currentTime, processes[index].at);
            currentTime = processes[index].start_time;
            console.log(`Process ${processes[index].pid} is starting...`);
        }

        if (processes[index].et_remaining - tq > 0) {
            processes[index].et_remaining -= tq;
            currentTime += tq;
            console.log(`Ready Queue at time ${currentTime}: ${queue.join(', ')}`);
        } else {
            currentTime += processes[index].et_remaining;
            processes[index].et_remaining = 0;
            completed++;
            console.log(`Process ${processes[index].pid} is completed.`);
            console.log(`Ready Queue at time ${currentTime}: ${queue.join(', ')}`);

            processes[index].ct = currentTime;
            processes[index].tat = processes[index].ct - processes[index].at;
            processes[index].wt = processes[index].tat - processes[index].et;
            processes[index].rt = processes[index].start_time - processes[index].at;
            processes[index].utilization = (processes[index].et / processes[index].tat) * 100;

            sumTAT += processes[index].tat;
            sumWT += processes[index].wt;
            sumRT += processes[index].rt;
            sumUtil += processes[index].utilization;
        }

        for (let i = 1; i < processCount; i++) {
            if (processes[i].et_remaining > 0 && processes[i].at <= currentTime && !visited[i]) {
                queue.push(i);
                visited[i] = true;
            }
        }

        if (processes[index].et_remaining > 0) queue.push(index);

        if (queue.length === 0) {
            currentTime = Math.min(...processes.filter(p => p.et_remaining > 0).map(p => p.at));
            console.log(`CPU is idle. Advancing time to ${currentTime}`);
            for (let i = 1; i < processCount; i++) {
                if (processes[i].et_remaining > 0 && processes[i].at <= currentTime && !visited[i]) {
                    queue.push(i);
                    visited[i] = true;
                    break;
                }
            }
        }
    };

    document.getElementById('inputfields').style.display = 'none';

    document.getElementById('tablecontainer').style.display = 'block';

    let tableHead = document.querySelector('#resultTable thead');
    tableHead.innerHTML =
        `
                    <tr>
                        <th>PID</th>
                        <th>AT</th>
                        <th>ET</th>
                        <th>ST</th>
                        <th>CT</th>
                        <th>TAT</th>
                        <th>WT</th>
                        <th>RT</th>
                        <th>UT</th>
                    </tr>
                `;

    let tableBody = document.querySelector('#resultTable tbody');
    tableBody.innerHTML = '';
    processes.forEach(p => {
        let row = `<tr>
                    <td>${p.pid}</td>
                    <td>${p.at}</td>
                    <td>${p.et}</td>
                    <td>${p.start_time}</td>
                    <td>${p.ct}</td>
                    <td>${p.tat}</td>
                    <td>${p.wt}</td>
                    <td>${p.rt}</td>
                    <td>${p.utilization.toFixed(2)}%</td>
                </tr>`;
        tableBody.innerHTML += row;
    });

    document.getElementById('summarycontainer').style.display = 'block';

    document.getElementById('summaryheading').innerHTML =
        `Summary`;

    document.getElementById('summary').innerHTML = `
              Average Turnaround Time: ${(sumTAT / processCount).toFixed(2)}<br>
              Average Waiting Time: ${(sumWT / processCount).toFixed(2)}<br>
              Average Response Time: ${(sumRT / processCount).toFixed(2)}<br>
              Average Utilization: ${(sumUtil / processCount).toFixed(2)}%
            `;


}
