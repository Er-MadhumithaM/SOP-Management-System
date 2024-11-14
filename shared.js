// Function to save assembly log data to localStorage and notify manager
function saveAssemblyLog(employeeID, logData) {
    let assemblyLogs = JSON.parse(localStorage.getItem('assemblyLogs')) || {};
    if (!assemblyLogs[employeeID]) {
        assemblyLogs[employeeID] = [];
    }
    assemblyLogs[employeeID].push(logData);
    localStorage.setItem('assemblyLogs', JSON.stringify(assemblyLogs));

    // Notify the manager when an employee submits a log entry
    const managerID = getManagerForEmployee(employeeID);
    addNotification(managerID, `New log submitted by employee ${employeeID} for ${logData.pID}`);
}


// Function to load all assembly logs from localStorage for a particular employee
function loadAssemblyLogs(employeeID) {
    const assemblyLogs = JSON.parse(localStorage.getItem('assemblyLogs')) || {};
    return assemblyLogs[employeeID] || [];
}

// Function to load all logs from all employees (for the manager)
function loadAllEmployeeLogs() {
    return JSON.parse(localStorage.getItem('assemblyLogs')) || {};
}

// Function to display logs in the employee dashboard
function displayEmployeeLogs(employeeID, tableBodyID) {
    const logs = loadAssemblyLogs(employeeID);
    const loggedInEmployee = sessionStorage.getItem('employeeName');
    const tableBody = document.getElementById(tableBodyID);
    tableBody.innerHTML = '';  // Clear the table body

    logs.forEach((log, index) => {
        const isDeleted = log.deleted || false;
        if (!isDeleted) {
            const row = `
                <tr id="row-${employeeID}-${index}">
                    <td>${employeeID}</td>
                    <td>${loggedInEmployee}</td>
                    <td>${log.date}</td>
                    <td>${log.pID}</td>
                    <td>${log.pName}</td>
                    <td>${log.pStatus}</td>
                    <td>${log.stepNo || '-'}</td>
                    <td>${log.issues || 'None'}</td>
                    <td>${log.approvalStatus || 'Pending'}</td>
                    <td>${log.remarks || ''}</td>
                    <td><button onclick="deleteLog('${employeeID}', ${index})" class="delete-btn"><i class="bi bi-trash3-fill"></i></button></td>
                </tr>
            `;
            
	    tableBody.insertAdjacentHTML('afterbegin', row); // Add new rows at the top
        }
    });
}

// Delete log entry (mark as deleted)
function deleteLog(employeeID, logIndex) {
    let assemblyLogs = loadAllEmployeeLogs();
    assemblyLogs[employeeID][logIndex].deleted = true;
    localStorage.setItem('assemblyLogs', JSON.stringify(assemblyLogs));
    document.getElementById(`row-${employeeID}-${logIndex}`).remove();
}

function displayManagerLogs(tableBodyID) {
    const allLogs = loadAllEmployeeLogs();
    const loggedInManagerID = sessionStorage.getItem('empID'); // Get the logged-in manager's ID
    const tableBody = document.getElementById(tableBodyID);
    tableBody.innerHTML = '';  // Clear the table body

    Object.keys(allLogs).forEach(employeeID => {
        // Check if the logged-in manager is the manager for this employee
        if (getManagerForEmployee(employeeID) === loggedInManagerID) {
            allLogs[employeeID].forEach((log, index) => {
                const isDeleted = log.deleted || false;  // Check if the log is marked as deleted
                const isApproved = log.approvalStatus === 'Approved';  // Check if the log is approved
    
                const disabledClass = isDeleted ? 'disabled' : '';  // Add 'disabled' class if deleted
    
                const row = 
                    `<tr class="${disabledClass}">
                        <td>${employeeID}</td>
                        <td>${log.date}</td>
                        <td>${log.pID}</td>
                        <td>${log.pName}</td>
                        <td>${log.pStatus}</td>
                        <td>${log.stepNo}</td>
                        <td>${log.issues}</td>
                        <td id="status-${employeeID}-${index}">${log.approvalStatus || 'Pending'}</td>
                        <td><input type="text" id="remarks-${employeeID}-${index}" value="${log.remarks || ''}" ${isDeleted || isApproved ? 'disabled' : ''}></td>
                        <td><button onclick="approveLog('${employeeID}', ${index})" ${isDeleted || isApproved ? 'disabled' : ''}>Approve</button></td>
                    </tr>`;
    
                tableBody.insertAdjacentHTML('afterbegin', row); // Add new rows at the top
            });
        }
    });
}

function approveLog(employeeID, logIndex) {
    let assemblyLogs = loadAllEmployeeLogs();
    const remark = document.getElementById(`remarks-${employeeID}-${logIndex}`).value;

    // Update the log's approval status and remarks
    assemblyLogs[employeeID][logIndex].approvalStatus = 'Approved';
    assemblyLogs[employeeID][logIndex].remarks = remark;

    // Save back to localStorage
    localStorage.setItem('assemblyLogs', JSON.stringify(assemblyLogs));

    // Update the UI: Set status to 'Approved', disable remarks and approve button
    document.getElementById(`status-${employeeID}-${logIndex}`).innerText = 'Approved';
    document.getElementById(`remarks-${employeeID}-${logIndex}`).disabled = true;
    document.querySelector(`button[onclick="approveLog('${employeeID}', ${logIndex})"]`).disabled = true;

    // Notify the employee (optional: adjust based on notification setup)
    addNotification(employeeID,`Your log for ${assemblyLogs[employeeID][logIndex].pID} has been approved.`);

    alert('Log approved successfully');
}
    
// Function to add a notification for a specific user
function addNotification(userID, message) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || {};
    if (!notifications[userID]) {
        notifications[userID] = [];
    }

    const timestamp = new Date().toLocaleString();
    notifications[userID].unshift({ message, read: false, timestamp });
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Function to load notifications for a specific user
function loadNotifications(userID) {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || {};
    return notifications[userID] || [];
}

// Function to mark notifications as read for a specific user
function markNotificationsAsRead(userID) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || {};
    if (notifications[userID]) {
        notifications[userID].forEach(notification => {
            notification.read = true;
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));

	// Update badge count in real-time after marking as read
        const unreadCount = loadNotifications(userID).filter(notification => !notification.read).length;
        updateNotificationBadge(unreadCount);
    }
}

// Helper function to get the manager ID for an employee
function getManagerForEmployee(employeeID) {
    const employeeManagerMapping = {
        '22424': '22422',
        '22423': '22421',
    };
    return employeeManagerMapping[employeeID] || 'manager';
}